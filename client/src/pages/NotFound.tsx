import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="font-serif text-7xl font-semibold text-muted-foreground/50">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">We couldn't find that page.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
