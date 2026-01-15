# ChurchFlow

A Church Management Web Application for Assemblies of God – Ghana local churches.

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Google Sheets Database:**
    The application is configured to use the Google Sheet: [ChurchFlow](https://docs.google.com/spreadsheets/d/1d6Z_09KYOSyKtwyCeBh7-KcUJy7ZNzvUh59L31B7POI/edit?usp=sharing)
    
    **Important:** You must set up Google Service Account credentials for the app to write to the sheet.
    
    - Create a Service Account in Google Cloud Console.
    - Enable Google Sheets API.
    - Share the Google Sheet with the Service Account email (Editor access).
    - Download the JSON key file.
    - Either:
        - Set `GOOGLE_PRIVATE_KEY` and `GOOGLE_SERVICE_ACCOUNT_EMAIL` in `.env`.
        - OR save the JSON key as `service-account-key.json` in the project root.

3.  **Run the app:**
    ```bash
    npm run dev
    ```

## Architecture

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Database:** Google Sheets
- **Modules:**
    - Dashboard (implemented)
    - Members
    - Departments
    - Events
    - Finance
    - Reports

## AI Prompts

See [AI_PROMPTS.md](AI_PROMPTS.md) for the generated AI prompts.
