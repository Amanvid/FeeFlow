export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>
          &copy; {currentYear} FeeFlow Navigator{" "}
          <a
            href="https://studio--nexora-cloud-lvt16.us-central1.hosted.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            Power by Nexora Systems
          </a>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
