import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import axios from "axios"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const drugList = searchParams.get("drug_list")
  const professional = searchParams.get("professional") === "1"

  if (!drugList) {
    return NextResponse.json({ error: "No drug list provided" }, { status: 400 })
  }

  try {
    // Make the API call to drugs.com with browser-like headers using axios
    const response = await axios({
      method: "get",
      url: `https://www.drugs.com/interactions-check.php?drug_list=${drugList}${professional ? "&professional=1" : ""}`,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "https://www.drugs.com/",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
        "sec-ch-ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
      },
    })

    // Parse the HTML response using cheerio
    const interactions = parseInteractionsHtml(response.data)

    return NextResponse.json({ interactions })
  } catch (error) {
    console.error("Error fetching drug interactions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch drug interactions. Please try again later.",
      },
      { status: 500 },
    )
  }
}

function parseInteractionsHtml(html: string) {
  const $ = cheerio.load(html)
  const interactions = []

  // Extract drug-drug interactions
  $(".interactions-reference").each((i, el) => {
    const header = $(el).find(".interactions-reference-header")
    const severity = header.find(".ddc-status-label").text().trim()
    const title = header.find("h3").text().trim()
    const appliesTo = header.find("p").text().replace("Applies to:", "").trim()
    const description = $(el).find("p").not(".interactions-reference-header p").first().text().trim()

    // Determine interaction type
    let type = "Drug-Drug"
    if (title.toLowerCase().includes("food")) {
      type = "Food"
    } else if (title.toLowerCase().includes("alcohol")) {
      type = "Alcohol"
    }

    interactions.push({
      type,
      severity,
      title,
      description,
      applies_to: appliesTo.split(", "),
    })
  })

  return interactions
}

