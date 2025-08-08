import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { Upload, Map, Building2 } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Company Data</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/upload"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              <Upload className="h-4 w-4 mr-2 inline" />
              Upload
            </Link>
            <Link
              href="/companies"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              <Building2 className="h-4 w-4 mr-2 inline" />
              Companies
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
