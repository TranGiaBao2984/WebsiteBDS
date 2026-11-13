# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Overseas clients who want to rent, buy, or relocate to Japan. They may use English, Japanese, or Vietnamese. Their job is to understand a specific home or service and reach Mii Shintani, who replies personally.

Mii operates a private admin to publish listings and handle those inquiries. That tool is not a public product.

## Product Purpose

Give overseas clients a curated way to see properties Mii is offering or advising on, and a direct path to her for rental, purchase, and relocation support in Japan.

Success is a visitor who understands an offering and starts a real conversation with Mii. The site does not complete a rental or purchase by itself.

## Positioning

This is Mii Shintani’s personal advisory practice at RE AGENT by Re iDea (株式会社 Re iDea), based in Hachioji, Tokyo. Listings are ones she is offering or advising on. A neighboring portal could not truthfully claim her name, her reply, or this practice’s trilingual support.

## Operating Context

Visitors browse featured homes, filter the catalog by area and layout, open a property, and inquire. They can also call, email, use WhatsApp, or open Instagram. The public site is separate from the company site at re-idea.com.

Mii manages listings and incoming inquiries in a Vietnamese admin. Inquiry states in that tool are pending, consulting, paid, and cancelled. Listings and inquiries are stored in Supabase; a new inquiry can also be emailed.

## Capabilities and Constraints

Public routes: home (`/`), catalog (`/properties`), property detail (`/properties/[id]`), and about (`/about`). The public site is English, Japanese, and Vietnamese, with English as the default. Services are rental, sales (homes, condominiums, traditional kominka, and investment property), and relocation support.

Admin (`/admin`) is an internal Vietnamese tool for signed-in use: create and edit listings, and read inquiries. It is not part of the public product.

Future work must not present the site as a complete Japan-wide portal, and must not invent licenses, awards, testimonials, client counts, or prices.

## Brand Commitments

- Name: Mii Shintani (新谷 美依), Global Property Advisor
- Practice: RE AGENT by Re iDea, 株式会社 Re iDea
- Slogan: People. Homes. A Brighter Tomorrow.
- Public line: Helping Overseas Clients Find Homes in Japan
- Office: 〒192-0031, 東京都八王子市小宮町1076-5 ジュネス石川102号室 (Jeunesse Ishikawa 102, 1076-5 Komiyamachi, Hachioji-shi, Tokyo)
- Mobile: 070-9017-1920 · Tel: 042-656-8521 · Fax: 042-656-8520
- Email: japanrealtormii@re-idea.com
- WhatsApp: https://wa.me/817090171920
- Instagram: @MIISHINTANI_AGENT (https://www.instagram.com/miishintani_agent/)
- Company site: https://www.re-idea.com/

## Evidence on Hand

Published identity and contact facts live in `lib/site.ts` and `lib/agent-info.ts`. About-page copy in English, Japanese, and Vietnamese lives in `app/front/about.tsx`. The advisor portrait is `public/face.jpg`.

There are no testimonials, license numbers, awards, press mentions, or client counts in the project. Future work must not fabricate them.

## Product Principles

- Help the visitor decide whether to talk to Mii, then make that conversation easy.
- Offer the same practice in English, Japanese, and Vietnamese, with English as the default.
- Show only properties Mii is offering or advising on.
- Keep the published name, slogan, office, and contact channels as they are.
- Do not invent proof the practice does not have.
