import { useAuth } from "@/contexts/AuthContext";
import { CartProduct, formatPrice, useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Box,
  CheckCircle2,
  ChevronRight,
  Hammer,
  LogIn,
  Menu,
  MessageCircle,
  Package2,
  Search,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  UserPlus,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useParams } from "wouter";

const fallbackImage =
  "https://images.unsplash.com/photo-1606503153255-59d8b8b82176?auto=format&fit=crop&w=1200&q=80";

// ─── SHARED FIELD ────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-md border border-border bg-card px-3 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

// ─── LAYOUT ──────────────────────────────────────────────────────────────────
function Header() {
  const cart = useCart();
  const auth = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/90 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex w-9 h-9 rounded-md bg-primary text-primary-foreground items-center justify-center">
            <Box className="w-5 h-5" />
          </span>
          <span className="font-serif text-2xl font-semibold tracking-tight">GameNest</span>
          <span className="text-muted-foreground text-sm hidden sm:inline">Designs</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <Link href="/shop?category=inserts" className="hover:text-primary transition-colors">Inserts</Link>
          <Link href="/shop?category=digital-files" className="hover:text-primary transition-colors">Digital Files</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          {auth.user ? (
            <Link
              href={auth.isAdmin ? "/admin" : "/account"}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium"
            >
              {auth.isAdmin ? "Admin" : "My Account"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-secondary text-sm font-medium"
            >
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
          )}
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart</span>
            {cart.itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-accent-foreground text-[11px] font-bold">
                {cart.itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-secondary"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <nav className="container py-4 flex flex-col gap-1 text-sm">
            {[
              { href: "/shop", label: "Shop" },
              { href: "/contact", label: "Contact" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-md hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
            {auth.user ? (
              <Link
                href={auth.isAdmin ? "/admin" : "/account"}
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-md hover:bg-secondary"
              >
                {auth.isAdmin ? "Admin" : "My Account"}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="py-2 px-3 rounded-md hover:bg-secondary"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/70">
      <div className="container py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex w-8 h-8 rounded-md bg-primary text-primary-foreground items-center justify-center">
              <Box className="w-4 h-4" />
            </span>
            <span className="font-serif text-xl font-semibold">GameNest Designs</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Boutique board game inserts and accessories — hand-crafted in small batches for collectors who want their table to feel like a treasure.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/shop">All products</Link></li>
            <li><Link href="/shop?category=inserts">Inserts</Link></li>
            <li><Link href="/shop?category=component-upgrades">Component Upgrades</Link></li>
            <li><Link href="/shop?category=digital-files">Digital Files</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/contact">Contact us</Link></li>
            <li><Link href="/account">Your account</Link></li>
            <li><Link href="/account/orders">Order history</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Studio</h4>
          <p className="text-sm text-muted-foreground">
            Made with Bambu Lab 3D printers. Most pieces ship within 2–3 business days from the studio.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} GameNest Designs. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-primary">Terms</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/refunds" className="hover:text-primary">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!auth.isLoading && !auth.user) navigate("/login");
  }, [auth.isLoading, auth.user]);
  if (auth.isLoading || !auth.user)
    return (
      <PageShell>
        <div className="container py-20 text-muted-foreground">Loading…</div>
      </PageShell>
    );
  return <>{children}</>;
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({
  product,
}: {
  product: {
    id: number;
    name: string;
    slug: string;
    priceCents: number;
    imageUrls: string[];
    isDigital: boolean;
    inventoryCount: number;
  };
}) {
  const cart = useCart();
  return (
    <div className="gnd-card overflow-hidden group flex flex-col">
      <Link href={`/products/${product.slug}`} className="aspect-[4/3] block bg-secondary overflow-hidden">
        <img
          src={product.imageUrls[0] ?? fallbackImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Link
          href={`/products/${product.slug}`}
          className="font-serif text-lg leading-tight hover:text-primary line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-semibold text-lg">{formatPrice(product.priceCents)}</span>
          <button
            onClick={() => {
              cart.addItem(product as CartProduct, 1);
              toast.success(`Added to cart`);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Add
          </button>
        </div>
        {product.isDigital ? (
          <span className="mt-2 text-xs text-muted-foreground">Digital download</span>
        ) : product.inventoryCount >= 0 && product.inventoryCount <= 3 ? (
          <span className="mt-2 text-xs text-destructive">Only {product.inventoryCount} left</span>
        ) : null}
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
export function HomePage() {
  const products = trpc.shop.products.useQuery({ featured: true });
  const categories = trpc.shop.categories.useQuery();

  return (
    <PageShell>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/30 border border-accent/40 text-xs font-semibold uppercase tracking-wider">
              <Hammer className="w-3.5 h-3.5" /> Hand-built in small batches
            </span>
            <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] font-semibold mt-4">
              Inserts that turn <em className="italic not-italic">setup</em> into ceremony.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg">
              Modular wooden organizers, sleeve-friendly card lanes, and 3D-printed token vaults — engineered for the games you love most.
            </p>
            <div className="mt-7 flex gap-3 flex-wrap">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90"
              >
                Explore the catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?category=digital-files"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-md border border-border bg-card font-semibold hover:bg-secondary"
              >
                Digital STL files
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Truck className="w-4 h-4" /> Ships from the US</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Quality guaranteed</span>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
              <img
                src="https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1200&q=80"
                alt="Board game insert"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 gnd-card p-5 max-w-xs hidden md:block">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Game ready</p>
              <p className="font-serif text-xl mt-1">Setup in 60 seconds.</p>
              <p className="text-sm text-muted-foreground mt-1">Modular trays lift out and slide back — no fuss.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.data && categories.data.length > 0 && (
        <section className="container py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold">Browse by craft</h2>
              <p className="text-muted-foreground mt-1">Each piece is built around the games it serves.</p>
            </div>
            <Link href="/shop" className="text-sm font-semibold inline-flex items-center gap-1 hover:text-primary">
              All products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.data.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="gnd-card group p-6 hover:-translate-y-0.5 transition-transform"
              >
                <div className="text-xs uppercase tracking-wider font-semibold text-accent-foreground/70">{cat.name}</div>
                <p className="font-serif text-xl mt-2">{cat.description?.slice(0, 70) ?? "Curated picks"}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary group-hover:gap-2 transition-all">
                  Shop now <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="container pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">Recently in the workshop</h2>
            <p className="text-muted-foreground mt-1">Limited runs — once they're gone, they're gone.</p>
          </div>
        </div>
        {products.isLoading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.data?.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
            {products.data?.length === 0 && (
              <div className="col-span-full text-muted-foreground gnd-card p-10 text-center">
                No products yet — add some from the admin panel.
              </div>
            )}
          </div>
        )}
      </section>
    </PageShell>
  );
}

// ─── SHOP ─────────────────────────────────────────────────────────────────────
export function ShopPage() {
  const [location] = useLocation();
  const qs = location.includes("?") ? location.split("?")[1] : "";
  const params = new URLSearchParams(qs);
  const category = params.get("category") ?? undefined;
  const [search, setSearch] = useState(params.get("search") ?? "");
  const products = trpc.shop.products.useQuery({ category, search: search || undefined });
  const categories = trpc.shop.categories.useQuery();

  return (
    <PageShell>
      <section className="container py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold">The catalog</h1>
            <p className="text-muted-foreground mt-1">Inserts, organizers, upgrades, and digital files.</p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-3 h-11 rounded-md border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          <aside className="space-y-1">
            <Link href="/shop" className={`block px-3 py-2 rounded-md text-sm font-medium ${!category ? "bg-secondary" : "hover:bg-secondary"}`}>
              All products
            </Link>
            {categories.data?.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${category === cat.slug ? "bg-secondary" : "hover:bg-secondary"}`}
              >
                {cat.name}
              </Link>
            ))}
          </aside>
          <div>
            {products.isLoading ? (
              <div className="text-muted-foreground">Loading…</div>
            ) : products.data && products.data.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.data.map((p) => (
                  <ProductCard key={p.id} product={p as any} />
                ))}
              </div>
            ) : (
              <div className="gnd-card p-12 text-center text-muted-foreground">No products match your filters.</div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

// ─── PRODUCT DETAIL ───────────────────────────────────────────────────────────
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const cart = useCart();
  const [, navigate] = useLocation();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const product = trpc.shop.product.useQuery({ slug: slug! });

  if (product.isLoading)
    return <PageShell><div className="container py-20 text-muted-foreground">Loading…</div></PageShell>;
  if (product.error || !product.data)
    return <PageShell><div className="container py-20"><h1 className="font-serif text-3xl">Product not found</h1></div></PageShell>;

  const p = product.data;

  return (
    <PageShell>
      <section className="container py-12 grid md:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square rounded-xl overflow-hidden border border-border bg-card mb-3">
            <img
              src={p.imageUrls?.[activeImage] ?? fallbackImage}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          </div>
          {p.imageUrls && p.imageUrls.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {p.imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square overflow-hidden rounded-md border-2 ${idx === activeImage ? "border-primary" : "border-transparent"}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-serif text-4xl font-semibold">{p.name}</h1>
          <div className="mt-2 text-2xl font-semibold">{formatPrice(p.priceCents)}</div>
          <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line">{p.description}</p>
          <div className="mt-8 flex items-end gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Qty</label>
              <input
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                className="block mt-1 w-20 h-12 rounded-md border border-border bg-card px-3"
              />
            </div>
            <button
              onClick={() => { cart.addItem(p as CartProduct, qty); toast.success(`Added ${qty} × ${p.name} to cart`); }}
              className="h-12 px-8 rounded-md bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2 hover:opacity-90"
            >
              <ShoppingBag className="w-4 h-4" /> Add to cart
            </button>
            <button
              onClick={() => { cart.addItem(p as CartProduct, qty); navigate("/cart"); }}
              className="h-12 px-6 rounded-md border border-border bg-card font-semibold hover:bg-secondary"
            >
              Buy now
            </button>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2"><Truck className="w-4 h-4 mt-0.5 shrink-0" /><span>Ships in 2–3 business days</span></div>
            <div className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" /><span>Quality guaranteed — <Link href="/refunds" className="text-primary hover:underline">see refund policy</Link></span></div>
            <div className="flex items-start gap-2 sm:col-span-2"><Box className="w-4 h-4 mt-0.5 shrink-0" /><span>Made by Bambu Lab 3D printers</span></div>
            {p.isDigital && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <Package2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Digital download — link delivered after payment</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

// ─── CART ─────────────────────────────────────────────────────────────────────
export function CartPage() {
  const cart = useCart();
  const [, navigate] = useLocation();

  return (
    <PageShell>
      <section className="container py-12">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-8">Your cart</h1>
        {cart.items.length === 0 ? (
          <div className="gnd-card p-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link href="/shop" className="mt-4 inline-flex items-center gap-1 px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="gnd-card divide-y divide-border">
              {cart.items.map((item) => (
                <div key={item.product.id} className="p-5 flex gap-4 items-center">
                  <img
                    src={item.product.imageUrls?.[0] ?? fallbackImage}
                    className="w-20 h-20 rounded-md object-cover shrink-0"
                    alt={item.product.name}
                  />
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="font-serif text-lg hover:text-primary line-clamp-1">
                      {item.product.name}
                    </Link>
                    <div className="text-sm text-muted-foreground">{formatPrice(item.product.priceCents)} each</div>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(e) => cart.updateQuantity(item.product.id, Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 h-10 rounded-md border border-border bg-card px-2 text-center"
                  />
                  <div className="font-semibold w-20 text-right">{formatPrice(item.product.priceCents * item.quantity)}</div>
                  <button onClick={() => cart.removeItem(item.product.id)} className="p-2 rounded-md hover:bg-secondary text-muted-foreground" aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <CartSummary onCheckout={() => navigate("/checkout")} />
          </div>
        )}
      </section>
    </PageShell>
  );
}

function CartSummary({ onCheckout }: { onCheckout: () => void }) {
  const cart = useCart();
  return (
    <aside className="gnd-card p-6 h-fit sticky top-20">
      <h2 className="font-serif text-2xl font-semibold mb-4">Summary</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cart.subtotalCents)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{cart.shippingCents ? formatPrice(cart.shippingCents) : "Free"}</span></div>
        <div className="flex justify-between text-lg font-semibold border-t border-border pt-3 mt-3">
          <span>Total</span><span>{formatPrice(cart.totalCents)}</span>
        </div>
      </div>
      <button
        onClick={onCheckout}
        className="mt-5 w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 inline-flex items-center justify-center gap-2"
      >
        Checkout <ArrowRight className="w-4 h-4" />
      </button>
    </aside>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
export function CheckoutPage() {
  const cart = useCart();
  const auth = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    customerEmail: auth.user?.email ?? "",
    firstName: auth.user?.firstName ?? "",
    lastName: auth.user?.lastName ?? "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
  });
  const [discountCode, setDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const validate = trpc.shop.validateDiscount.useMutation();
  const checkout = trpc.shop.createCheckoutSession.useMutation();

  useEffect(() => {
    if (cart.items.length === 0) navigate("/cart");
  }, [cart.items.length]);

  async function applyDiscount() {
    try {
      const res = await validate.mutateAsync({ code: discountCode, subtotal: cart.subtotalCents });
      setDiscountValue(res.discountAmount);
      toast.success(`Discount applied: -${formatPrice(res.discountAmount)}`);
    } catch (e: any) {
      toast.error(e.message ?? "Invalid code");
      setDiscountValue(0);
    }
  }

  async function submit() {
    try {
      const res = await checkout.mutateAsync({
        items: cart.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        customerEmail: form.customerEmail,
        customerName: `${form.firstName} ${form.lastName}`.trim() || form.customerEmail,
        shippingAddress: {
          firstName: form.firstName,
          lastName: form.lastName,
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          phone: form.phone,
        },
        discountCode: discountCode || undefined,
      });
      cart.clearCart();
      if (res.checkoutUrl.startsWith("http")) window.location.href = res.checkoutUrl;
      else navigate(res.checkoutUrl);
    } catch (e: any) {
      toast.error(e.message ?? "Checkout failed");
    }
  }

  return (
    <PageShell>
      <section className="container py-12 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="gnd-card p-6 space-y-5">
          <h1 className="font-serif text-3xl font-semibold">Checkout</h1>
          <Field label="Email" value={form.customerEmail} onChange={(v) => setForm((f) => ({ ...f, customerEmail: v }))} type="email" />
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="First name" value={form.firstName} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} />
            <Field label="Last name" value={form.lastName} onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
          </div>
          <Field label="Street address" value={form.street} onChange={(v) => setForm((f) => ({ ...f, street: v }))} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
            <Field label="State" value={form.state} onChange={(v) => setForm((f) => ({ ...f, state: v }))} />
            <Field label="ZIP" value={form.zip} onChange={(v) => setForm((f) => ({ ...f, zip: v }))} />
          </div>
          <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} type="tel" />
        </div>
        <aside className="gnd-card p-6 h-fit space-y-4">
          <h2 className="font-serif text-2xl font-semibold">Order summary</h2>
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>{item.quantity} × {item.product.name}</span>
              <span>{formatPrice(item.product.priceCents * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(cart.subtotalCents)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(cart.shippingCents)}</span></div>
            {discountValue > 0 && (
              <div className="flex justify-between text-primary"><span>Discount</span><span>-{formatPrice(discountValue)}</span></div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-1">
              <span>Total</span><span>{formatPrice(Math.max(0, cart.totalCents - discountValue))}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Discount code"
              className="flex-1 h-10 rounded-md border border-border bg-card px-3 text-sm"
            />
            <button onClick={applyDiscount} className="px-3 h-10 rounded-md border border-border bg-card text-sm font-medium hover:bg-secondary">
              Apply
            </button>
          </div>
          <button
            onClick={submit}
            disabled={checkout.isPending}
            className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {checkout.isPending ? "Processing…" : "Place order"}
          </button>
          <p className="text-xs text-muted-foreground">
            Payment is processed securely by Stripe. Your card details never touch our servers.
          </p>
        </aside>
      </section>
    </PageShell>
  );
}

// ─── ORDER CONFIRMATION ───────────────────────────────────────────────────────
export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const order = trpc.shop.order.useQuery({ orderNumber: orderNumber! });
  return (
    <PageShell>
      <section className="container py-16 max-w-2xl">
        <div className="gnd-card p-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
          <h1 className="font-serif text-3xl font-semibold mt-3">Thank you for your order!</h1>
          <p className="text-muted-foreground mt-2">
            Order <strong>{orderNumber}</strong> has been received. A confirmation email is on its way.
          </p>
          {order.data && (
            <div className="mt-6 text-left text-sm space-y-1 border-t border-border pt-4">
              {order.data.items.map((it: any) => (
                <div key={it.id} className="flex justify-between">
                  <span>{it.quantity} × {it.productName}</span>
                  <span>{formatPrice(it.totalPrice)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-2 border-t border-border mt-2">
                <span>Total</span><span>{formatPrice(order.data.totalAmount)}</span>
              </div>
            </div>
          )}
          <Link href="/shop" className="inline-flex items-center gap-1 mt-8 px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold">
            Continue shopping
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const [, navigate] = useLocation();
  const auth = useAuth();
  const login = trpc.auth.login.useMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (auth.user) navigate(auth.isAdmin ? "/admin" : "/account");
  }, [auth.user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      await auth.refetch();
      toast.success("Signed in");
      navigate(auth.isAdmin ? "/admin" : "/account");
    } catch (e: any) {
      toast.error(e.message ?? "Sign in failed");
    }
  }

  return (
    <PageShell>
      <section className="container py-16 max-w-md">
        <div className="gnd-card p-8">
          <h1 className="font-serif text-3xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to access your orders and saved details.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="Password" value={password} onChange={setPassword} type="password" />
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> {login.isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="text-sm mt-4 text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="text-primary font-medium">Create an account</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}

export function SignupPage() {
  const [, navigate] = useLocation();
  const auth = useAuth();
  const signup = trpc.auth.signup.useMutation();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });

  useEffect(() => {
    if (auth.user) navigate("/account");
  }, [auth.user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signup.mutateAsync(form);
      await auth.refetch();
      toast.success("Account created — welcome!");
      navigate("/account");
    } catch (e: any) {
      toast.error(e.message ?? "Sign up failed");
    }
  }

  return (
    <PageShell>
      <section className="container py-16 max-w-md">
        <div className="gnd-card p-8">
          <h1 className="font-serif text-3xl font-semibold">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">For order history, faster checkout, and message support.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" value={form.firstName} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} />
              <Field label="Last name" value={form.lastName} onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
            </div>
            <Field label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} type="email" />
            <Field label="Password (8+ chars)" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} type="password" />
            <button
              type="submit"
              disabled={signup.isPending}
              className="w-full h-12 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> {signup.isPending ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="text-sm mt-4 text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium">Sign in</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}

// ─── ACCOUNT ──────────────────────────────────────────────────────────────────
function AccountTabs() {
  const [location] = useLocation();
  const auth = useAuth();
  const logout = trpc.auth.logout.useMutation();

  async function doLogout() {
    await logout.mutateAsync();
    await auth.refetch();
    window.location.href = "/";
  }

  const tabs = [
    { href: "/account", label: "Profile" },
    { href: "/account/orders", label: "Orders" },
    { href: "/account/addresses", label: "Addresses" },
    { href: "/account/messages", label: "Messages" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-3">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`px-4 h-10 rounded-md inline-flex items-center text-sm font-medium ${location === t.href ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
        >
          {t.label}
        </Link>
      ))}
      <div className="ml-auto">
        <button onClick={doLogout} className="px-4 h-10 rounded-md inline-flex items-center text-sm font-medium hover:bg-secondary">
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AccountPage() {
  const auth = useAuth();
  const update = trpc.account.updateProfile.useMutation({ onSuccess: () => auth.refetch() });
  const [form, setForm] = useState({
    firstName: auth.user?.firstName ?? "",
    lastName: auth.user?.lastName ?? "",
    phone: auth.user?.phone ?? "",
  });

  useEffect(() => {
    setForm({
      firstName: auth.user?.firstName ?? "",
      lastName: auth.user?.lastName ?? "",
      phone: auth.user?.phone ?? "",
    });
  }, [auth.user]);

  return (
    <RequireAuth>
      <PageShell>
        <section className="container py-12">
          <h1 className="font-serif text-4xl font-semibold mb-6">Your account</h1>
          <AccountTabs />
          <div className="gnd-card p-6 max-w-xl space-y-4">
            <div className="text-sm text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{auth.user?.email}</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="First name" value={form.firstName ?? ""} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} />
              <Field label="Last name" value={form.lastName ?? ""} onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
            </div>
            <Field label="Phone" value={form.phone ?? ""} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} type="tel" />
            <button
              onClick={async () => { await update.mutateAsync(form); toast.success("Profile updated"); }}
              className="px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold"
            >
              Save changes
            </button>
          </div>
        </section>
      </PageShell>
    </RequireAuth>
  );
}

export function AccountOrdersPage() {
  const orders = trpc.account.orders.useQuery();
  return (
    <RequireAuth>
      <PageShell>
        <section className="container py-12">
          <h1 className="font-serif text-4xl font-semibold mb-6">Your orders</h1>
          <AccountTabs />
          <div className="gnd-card divide-y divide-border">
            {orders.isLoading && <div className="p-6 text-muted-foreground">Loading…</div>}
            {orders.data?.length === 0 && <div className="p-6 text-muted-foreground">No orders yet.</div>}
            {orders.data?.map((o) => (
              <div key={o.id} className="p-5 flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <div className="font-semibold">{o.orderNumber}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <span className="text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded-full border border-border">{o.status}</span>
                <div className="font-semibold">{formatPrice(o.totalAmount)}</div>
              </div>
            ))}
          </div>
        </section>
      </PageShell>
    </RequireAuth>
  );
}

export function AccountAddressesPage() {
  const addrs = trpc.account.addresses.useQuery();
  const save = trpc.account.saveAddress.useMutation({ onSuccess: () => addrs.refetch() });
  const del = trpc.account.deleteAddress.useMutation({ onSuccess: () => addrs.refetch() });
  const [form, setForm] = useState({ firstName: "", lastName: "", street: "", city: "", state: "", zip: "", country: "US", phone: "" });

  return (
    <RequireAuth>
      <PageShell>
        <section className="container py-12">
          <h1 className="font-serif text-4xl font-semibold mb-6">Saved addresses</h1>
          <AccountTabs />
          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            <div className="gnd-card divide-y divide-border">
              {addrs.data?.length === 0 && <div className="p-6 text-muted-foreground">No saved addresses.</div>}
              {addrs.data?.map((a) => (
                <div key={a.id} className="p-5 flex justify-between items-center gap-3">
                  <div className="text-sm">
                    <div className="font-semibold">{a.firstName} {a.lastName}</div>
                    <div className="text-muted-foreground">{a.street}, {a.city}, {a.state} {a.zip}</div>
                  </div>
                  <button onClick={() => del.mutateAsync({ id: a.id })} className="p-2 rounded-md hover:bg-secondary"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="gnd-card p-5 space-y-3 h-fit">
              <h3 className="font-serif text-xl font-semibold">Add address</h3>
              <div className="grid grid-cols-2 gap-2">
                <Field label="First name" value={form.firstName} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} />
                <Field label="Last name" value={form.lastName} onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
              </div>
              <Field label="Street" value={form.street} onChange={(v) => setForm((f) => ({ ...f, street: v }))} />
              <div className="grid grid-cols-3 gap-2">
                <Field label="City" value={form.city} onChange={(v) => setForm((f) => ({ ...f, city: v }))} />
                <Field label="State" value={form.state} onChange={(v) => setForm((f) => ({ ...f, state: v }))} />
                <Field label="ZIP" value={form.zip} onChange={(v) => setForm((f) => ({ ...f, zip: v }))} />
              </div>
              <button
                onClick={async () => {
                  await save.mutateAsync({ ...form, type: "shipping" });
                  toast.success("Address saved");
                  setForm({ firstName: "", lastName: "", street: "", city: "", state: "", zip: "", country: "US", phone: "" });
                }}
                className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold"
              >
                Save address
              </button>
            </div>
          </div>
        </section>
      </PageShell>
    </RequireAuth>
  );
}

export function AccountMessagesPage() {
  const threads = trpc.account.myChats.useQuery();
  const start = trpc.account.startChat.useMutation({ onSuccess: () => threads.refetch() });
  const reply = trpc.account.sendChatMessage.useMutation({ onSuccess: () => threads.refetch() });
  const [activeId, setActiveId] = useState<number | null>(null);
  const active = trpc.account.chatThread.useQuery(
    activeId ? { conversationId: activeId } : (undefined as any),
    { enabled: !!activeId }
  );
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");

  return (
    <RequireAuth>
      <PageShell>
        <section className="container py-12">
          <h1 className="font-serif text-4xl font-semibold mb-6">Messages</h1>
          <AccountTabs />
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            <div className="gnd-card divide-y divide-border h-fit">
              {threads.data?.length === 0 && <div className="p-4 text-sm text-muted-foreground">No conversations yet.</div>}
              {threads.data?.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={`block w-full text-left p-4 ${activeId === t.id ? "bg-secondary" : "hover:bg-secondary"}`}
                >
                  <div className="font-semibold text-sm">{t.subject ?? "Conversation"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.lastMessageAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {activeId && active.data ? (
                <div className="gnd-card p-5">
                  <h3 className="font-serif text-xl font-semibold mb-3">{active.data.subject ?? "Conversation"}</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {active.data.messages.map((m: any) => (
                      <div key={m.id} className={`p-3 rounded-md ${m.senderRole === "owner" ? "bg-secondary" : "bg-primary text-primary-foreground"}`}>
                        <div className="text-xs uppercase font-semibold opacity-70 mb-1">{m.senderRole === "owner" ? "GameNest" : "You"}</div>
                        <div className="text-sm whitespace-pre-line">{m.message}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a reply…" className="flex-1 h-11 rounded-md border border-border bg-card px-3" />
                    <button
                      onClick={async () => { await reply.mutateAsync({ conversationId: activeId, message: draft }); setDraft(""); active.refetch(); }}
                      className="px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gnd-card p-5">
                  <h3 className="font-serif text-xl font-semibold mb-2">New conversation</h3>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="w-full h-11 rounded-md border border-border bg-card px-3 mb-3" />
                  <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="How can we help?" rows={5} className="w-full rounded-md border border-border bg-card p-3" />
                  <button
                    onClick={async () => { await start.mutateAsync({ subject, message: newMessage }); setSubject(""); setNewMessage(""); toast.success("Message sent"); }}
                    className="mt-3 px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </PageShell>
    </RequireAuth>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
export function ContactPage() {
  const auth = useAuth();
  const start = trpc.account.startChat.useMutation();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [, navigate] = useLocation();

  return (
    <PageShell>
      <section className="container py-16 max-w-2xl">
        <h1 className="font-serif text-4xl font-semibold">Contact us</h1>
        <p className="text-muted-foreground mt-2">
          Questions about a game, an order, or a custom design? We answer every message personally.
        </p>
        {auth.user ? (
          <div className="gnd-card p-6 mt-8 space-y-3">
            <Field label="Subject" value={subject} onChange={setSubject} />
            <label className="block">
              <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Message</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full rounded-md border border-border bg-card p-3" />
            </label>
            <button
              onClick={async () => {
                await start.mutateAsync({ subject, message });
                toast.success("Message sent — we'll be in touch soon!");
                navigate("/account/messages");
              }}
              className="px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold inline-flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Send message
            </button>
          </div>
        ) : (
          <div className="gnd-card p-6 mt-8">
            <p className="text-muted-foreground">
              Please{" "}
              <Link href="/login" className="text-primary font-medium">sign in</Link>
              {" "}or{" "}
              <Link href="/signup" className="text-primary font-medium">create an account</Link>
              {" "}to start a conversation. This keeps all your messages in one place.
            </p>
          </div>
        )}
      </section>
    </PageShell>
  );
}

// ─── ADMIN LAYOUT (top-tab — distinct from sidebar used by helm) ──────────────
function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const [location] = useLocation();
  const auth = useAuth();
  const logout = trpc.auth.logout.useMutation();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!auth.isLoading && (!auth.user || !auth.isAdmin)) navigate("/login");
  }, [auth.isLoading, auth.user, auth.isAdmin]);

  if (auth.isLoading || !auth.isAdmin)
    return (
      <PageShell>
        <div className="container py-20 text-muted-foreground">Loading…</div>
      </PageShell>
    );

  const tabs = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/customers", label: "Customers" },
    { href: "/admin/discounts", label: "Discounts" },
    { href: "/admin/chats", label: "Messages" },
    { href: "/admin/team", label: "Team" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-xl font-semibold">GameNest</Link>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-foreground/15 font-semibold uppercase tracking-wider">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm opacity-70 hidden sm:inline mr-2">{auth.user?.email}</span>
            <Link href="/" className="text-sm px-3 h-9 inline-flex items-center rounded-md hover:bg-primary-foreground/15">
              ← Store
            </Link>
            <button
              onClick={async () => { await logout.mutateAsync(); await auth.refetch(); navigate("/"); }}
              className="text-sm px-3 h-9 inline-flex items-center rounded-md hover:bg-primary-foreground/15"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <nav className="border-b border-border bg-card sticky top-0 z-30 shadow-sm">
        <div className="container flex items-center gap-0.5 overflow-x-auto h-12 scrollbar-none">
          {tabs.map((t) => {
            const active = t.href === "/admin" ? location === "/admin" : location.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-4 h-9 rounded-md inline-flex items-center text-sm font-medium whitespace-nowrap transition-colors ${active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="container py-8">
        <h1 className="font-serif text-3xl font-semibold mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
}

// ─── ADMIN OVERVIEW ───────────────────────────────────────────────────────────
export function AdminOverviewPage() {
  const stats = trpc.admin.stats.useQuery();
  const orders = trpc.admin.orders.useQuery();

  const cards = [
    { label: "Revenue", value: stats.data ? formatPrice(stats.data.revenueCents) : "—", hint: "All-time (excl. refunds)" },
    { label: "Orders", value: stats.data?.orders ?? "—", hint: "Total" },
    { label: "Customers", value: stats.data?.customers ?? "—", hint: "Active accounts" },
    { label: "Low stock", value: stats.data?.lowStock ?? "—", hint: "At/below threshold" },
    { label: "Open chats", value: stats.data?.openChats ?? "—", hint: "Awaiting reply" },
  ];

  return (
    <AdminLayout title="Overview">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="gnd-card p-5">
            <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{card.label}</div>
            <div className="font-serif text-3xl font-semibold mt-1">{card.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{card.hint}</div>
          </div>
        ))}
      </div>

      <div className="gnd-card">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold">Recent orders</h3>
          <Link href="/admin/orders" className="text-sm font-medium hover:text-primary">View all →</Link>
        </div>
        <div className="divide-y divide-border">
          {(orders.data ?? []).slice(0, 10).map((o) => (
            <div key={o.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="font-semibold text-sm">{o.orderNumber}</div>
                <div className="text-xs text-muted-foreground">{o.customerName} · {new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <span className="text-[11px] uppercase font-semibold px-2 py-1 rounded-full border border-border">{o.status}</span>
              <div className="font-semibold">{formatPrice(o.totalAmount)}</div>
            </div>
          ))}
          {(orders.data?.length ?? 0) === 0 && (
            <div className="p-6 text-muted-foreground">No orders yet.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── ADMIN PRODUCTS ───────────────────────────────────────────────────────────
function ProductForm({
  initial,
  categories,
  onCancel,
  onSave,
  onUploadImage,
}: {
  initial: any;
  categories: any[];
  onCancel: () => void;
  onSave: (v: any) => void;
  onUploadImage: (file: File) => Promise<string>;
}) {
  const [v, setV] = useState(initial);

  return (
    <div className="gnd-card p-5 mb-6 grid lg:grid-cols-2 gap-5">
      <div className="space-y-3">
        <Field label="Name" value={v.name} onChange={(x) => setV({ ...v, name: x })} />
        <Field
          label="Slug (URL-friendly)"
          value={v.slug}
          onChange={(x) =>
            setV({ ...v, slug: x.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") })
          }
        />
        <label className="block">
          <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Description</span>
          <textarea value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} rows={5} className="w-full rounded-md border border-border bg-card p-3" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Price (cents)</span>
            <input type="number" value={v.priceCents} onChange={(e) => setV({ ...v, priceCents: parseInt(e.target.value) || 0 })} className="w-full h-11 rounded-md border border-border bg-card px-3" />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Category</span>
            <select value={v.categoryId ?? ""} onChange={(e) => setV({ ...v, categoryId: e.target.value ? parseInt(e.target.value) : null })} className="w-full h-11 rounded-md border border-border bg-card px-3">
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Inventory (-1 = unlimited)</span>
            <input type="number" value={v.inventoryCount} onChange={(e) => setV({ ...v, inventoryCount: parseInt(e.target.value) })} className="w-full h-11 rounded-md border border-border bg-card px-3" />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Low-stock alert</span>
            <input type="number" value={v.lowStockThreshold} onChange={(e) => setV({ ...v, lowStockThreshold: parseInt(e.target.value) })} className="w-full h-11 rounded-md border border-border bg-card px-3" />
          </label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={v.isDigital} onChange={(e) => setV({ ...v, isDigital: e.target.checked })} /> Digital</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={v.featured} onChange={(e) => setV({ ...v, featured: e.target.checked })} /> Featured</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={v.bestseller} onChange={(e) => setV({ ...v, bestseller: e.target.checked })} /> Bestseller</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} /> Active</label>
        </div>
      </div>
      <div className="space-y-3">
        <label className="block">
          <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Image URLs (one per line)</span>
          <textarea
            value={(v.imageUrls ?? []).join("\n")}
            onChange={(e) => setV({ ...v, imageUrls: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) })}
            rows={4}
            placeholder="https://…"
            className="w-full rounded-md border border-border bg-card p-3 text-sm font-mono"
          />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Upload image</span>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const url = await onUploadImage(file);
                setV({ ...v, imageUrls: [...(v.imageUrls ?? []), url] });
                toast.success("Image uploaded");
              } catch {
                toast.error("Upload failed");
              }
            }}
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(v.imageUrls ?? []).map((u: string, i: number) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden border border-border">
              <img src={u} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        {v.isDigital && (
          <Field label="Digital file URL" value={v.digitalFileUrl ?? ""} onChange={(x) => setV({ ...v, digitalFileUrl: x })} />
        )}
        {!v.isDigital && (
          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Weight (oz)</span>
            <input type="number" value={v.weightOz ?? ""} onChange={(e) => setV({ ...v, weightOz: e.target.value ? parseInt(e.target.value) : null })} className="w-full h-11 rounded-md border border-border bg-card px-3" />
          </label>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 h-11 rounded-md border border-border bg-card font-medium">Cancel</button>
          <button onClick={() => onSave(v)} className="px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold">Save product</button>
        </div>
      </div>
    </div>
  );
}

export function AdminProductsPage() {
  const products = trpc.admin.products.useQuery();
  const categories = trpc.admin.categories.useQuery();
  const create = trpc.admin.createProduct.useMutation({ onSuccess: () => products.refetch() });
  const update = trpc.admin.updateProduct.useMutation({ onSuccess: () => products.refetch() });
  const deactivate = trpc.admin.deactivateProduct.useMutation({ onSuccess: () => products.refetch() });
  const upload = trpc.admin.uploadProductImage.useMutation();
  const [editing, setEditing] = useState<any | null>(null);

  function blankProduct() {
    return { name: "", slug: "", description: "", priceCents: 1000, categoryId: null, inventoryCount: 10, lowStockThreshold: 3, isDigital: false, digitalFileUrl: null, imageUrls: [], weightOz: null, dimensionsIn: null, featured: false, bestseller: false, active: true };
  }

  return (
    <AdminLayout title="Products">
      <div className="flex justify-end mb-4">
        <button onClick={() => setEditing(blankProduct())} className="px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold">
          + New product
        </button>
      </div>

      {editing !== null && (
        <ProductForm
          initial={editing}
          categories={categories.data ?? []}
          onCancel={() => setEditing(null)}
          onSave={async (values) => {
            try {
              if (editing.id) await update.mutateAsync({ id: editing.id, ...values });
              else await create.mutateAsync(values);
              toast.success("Saved");
              setEditing(null);
            } catch (e: any) { toast.error(e.message ?? "Save failed"); }
          }}
          onUploadImage={async (file) => {
            const dataBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const res = await upload.mutateAsync({ fileName: file.name, mimeType: file.type, dataBase64 });
            return res.url;
          }}
        />
      )}

      <div className="gnd-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.data?.map((p: any) => (
              <tr key={p.id}>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">{categories.data?.find((c) => c.id === p.categoryId)?.name ?? "—"}</td>
                <td className="p-3">{formatPrice(p.priceCents)}</td>
                <td className="p-3">{p.isDigital ? "Digital" : p.inventoryCount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {p.active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-3 text-right space-x-1">
                  <button onClick={() => setEditing(p)} className="px-3 h-8 rounded-md hover:bg-secondary text-sm">Edit</button>
                  <button onClick={() => { if (confirm("Hide this product?")) deactivate.mutateAsync({ id: p.id }); }} className="px-3 h-8 rounded-md hover:bg-secondary text-sm text-destructive">Hide</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(products.data?.length ?? 0) === 0 && (
          <div className="p-8 text-center text-muted-foreground">No products yet — click "+ New product".</div>
        )}
      </div>
    </AdminLayout>
  );
}

// ─── ADMIN CATEGORIES ─────────────────────────────────────────────────────────
export function AdminCategoriesPage() {
  const categories = trpc.admin.categories.useQuery();
  const create = trpc.admin.createCategory.useMutation({ onSuccess: () => categories.refetch() });
  const update = trpc.admin.updateCategory.useMutation({ onSuccess: () => categories.refetch() });
  const del = trpc.admin.deleteCategory.useMutation({ onSuccess: () => categories.refetch() });
  const [form, setForm] = useState({ name: "", slug: "", description: "", imageUrl: "", sortOrder: 0 });

  return (
    <AdminLayout title="Categories">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="gnd-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-3">Name</th><th className="p-3">Slug</th><th className="p-3">Sort</th><th className="p-3"></th></tr></thead>
            <tbody className="divide-y divide-border">
              {categories.data?.map((c) => (
                <tr key={c.id}>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                  <td className="p-3 text-muted-foreground">{c.sortOrder}</td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => { const name = prompt("New name:", c.name); if (name) update.mutateAsync({ id: c.id, name }); }}
                      className="px-3 h-8 rounded-md hover:bg-secondary text-sm"
                    >Rename</button>
                    <button
                      onClick={() => { if (confirm("Delete? Products will be un-categorised.")) del.mutateAsync({ id: c.id }); }}
                      className="px-3 h-8 rounded-md hover:bg-secondary text-sm text-destructive"
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(categories.data?.length ?? 0) === 0 && <div className="p-6 text-muted-foreground">No categories yet.</div>}
        </div>

        <div className="gnd-card p-5 space-y-3 h-fit">
          <h3 className="font-serif text-xl font-semibold">New category</h3>
          <Field
            label="Name"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v, slug: v.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "") }))}
          />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm((f) => ({ ...f, slug: v }))} />
          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Description</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full rounded-md border border-border bg-card p-3" />
          </label>
          <button
            onClick={async () => {
              await create.mutateAsync(form);
              setForm({ name: "", slug: "", description: "", imageUrl: "", sortOrder: 0 });
              toast.success("Category created");
            }}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold"
          >
            Add category
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── ADMIN ORDERS ─────────────────────────────────────────────────────────────
export function AdminOrdersPage() {
  const orders = trpc.admin.orders.useQuery();
  const update = trpc.admin.updateOrderStatus.useMutation({ onSuccess: () => orders.refetch() });
  const [activeId, setActiveId] = useState<number | null>(null);
  const order = trpc.admin.order.useQuery(activeId ? { id: activeId } : (undefined as any), { enabled: !!activeId });
  const [tracking, setTracking] = useState("");
  const [carrier, setCarrier] = useState("");

  return (
    <AdminLayout title="Orders">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="gnd-card overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Total</th></tr></thead>
            <tbody className="divide-y divide-border">
              {orders.data?.map((o) => (
                <tr key={o.id} onClick={() => setActiveId(o.id)} className={`cursor-pointer ${activeId === o.id ? "bg-secondary" : "hover:bg-secondary/50"}`}>
                  <td className="p-3 font-medium">{o.orderNumber}</td>
                  <td className="p-3">{o.customerName}</td>
                  <td className="p-3"><span className="text-[11px] uppercase font-semibold px-2 py-1 rounded-full border border-border">{o.status}</span></td>
                  <td className="p-3 font-semibold">{formatPrice(o.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(orders.data?.length ?? 0) === 0 && <div className="p-6 text-muted-foreground">No orders yet.</div>}
        </div>

        <div className="gnd-card p-5">
          {!activeId ? (
            <div className="text-muted-foreground">Select an order to view details.</div>
          ) : order.isLoading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : order.data ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-xl font-semibold">{order.data.orderNumber}</h3>
                <div className="text-sm text-muted-foreground">{order.data.customerName} · {order.data.customerEmail}</div>
              </div>
              <div className="text-sm space-y-1 border-y border-border py-3">
                {order.data.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between"><span>{it.quantity} × {it.productName}</span><span>{formatPrice(it.totalPrice)}</span></div>
                ))}
                <div className="flex justify-between font-semibold pt-2"><span>Total</span><span>{formatPrice(order.data.totalAmount)}</span></div>
              </div>
              <div className="text-sm">
                <div className="font-semibold mb-1">Ship to:</div>
                <div className="text-muted-foreground">
                  {order.data.shippingAddress?.street}, {order.data.shippingAddress?.city}, {order.data.shippingAddress?.state} {order.data.shippingAddress?.zip}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground">Update status</label>
                <select
                  value={order.data.status}
                  onChange={(e) => update.mutateAsync({ id: order.data!.id, status: e.target.value as any })}
                  className="w-full h-11 rounded-md border border-border bg-card px-3"
                >
                  {["pending","paid","processing","shipped","delivered","refunded","cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Tracking #" value={tracking} onChange={setTracking} />
                <Field label="Carrier" value={carrier} onChange={setCarrier} />
              </div>
              {(tracking || carrier) && (
                <button
                  onClick={() => update.mutateAsync({ id: order.data!.id, status: "shipped", trackingNumber: tracking, shippingCarrier: carrier })}
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold"
                >
                  Mark shipped & save tracking
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── ADMIN CUSTOMERS ──────────────────────────────────────────────────────────
export function AdminCustomersPage() {
  const customers = trpc.admin.customers.useQuery();
  return (
    <AdminLayout title="Customers">
      <div className="gnd-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left"><tr><th className="p-3">Email</th><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Joined</th></tr></thead>
          <tbody className="divide-y divide-border">
            {customers.data?.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-medium">{u.email}</td>
                <td className="p-3">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{u.role}</span></td>
                <td className="p-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(customers.data?.length ?? 0) === 0 && <div className="p-6 text-muted-foreground">No customers yet.</div>}
      </div>
    </AdminLayout>
  );
}

// ─── ADMIN TEAM ───────────────────────────────────────────────────────────────
export function AdminTeamPage() {
  const customers = trpc.admin.customers.useQuery();
  const promote = trpc.admin.promoteToAdmin.useMutation({ onSuccess: () => customers.refetch() });
  const demote = trpc.admin.demoteAdmin.useMutation({ onSuccess: () => customers.refetch() });
  const invite = trpc.admin.inviteAdmin.useMutation({ onSuccess: () => customers.refetch() });
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  const admins = useMemo(() => (customers.data ?? []).filter((u) => u.role === "admin"), [customers.data]);
  const others = useMemo(() => (customers.data ?? []).filter((u) => u.role !== "admin"), [customers.data]);

  return (
    <AdminLayout title="Team &amp; admins">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <div className="gnd-card divide-y divide-border">
            <div className="p-4 font-semibold text-sm">Current admins ({admins.length})</div>
            {admins.map((u) => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.email}</div>
                  <div className="text-xs text-muted-foreground">{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</div>
                </div>
                <button onClick={() => { if (confirm("Remove admin role?")) demote.mutateAsync({ id: u.id }); }} className="px-3 h-9 rounded-md hover:bg-secondary text-sm">Demote</button>
              </div>
            ))}
          </div>
          {others.length > 0 && (
            <div className="gnd-card divide-y divide-border">
              <div className="p-4 font-semibold text-sm">Promote a customer</div>
              {others.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div className="font-medium text-sm">{u.email}</div>
                  <button onClick={() => promote.mutateAsync({ id: u.id })} className="px-3 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium">Make admin</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="gnd-card p-5 space-y-3 h-fit">
          <h3 className="font-serif text-xl font-semibold">Invite a new admin</h3>
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Temporary password (8+ chars)" value={tempPassword} onChange={setTempPassword} type="text" />
          <button
            onClick={async () => {
              if (!email || tempPassword.length < 8) return toast.error("Email + temp password (8+ chars) required");
              await invite.mutateAsync({ email, tempPassword });
              setEmail(""); setTempPassword("");
              toast.success("Admin account created");
            }}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold"
          >
            Create admin
          </button>
          <p className="text-xs text-muted-foreground">
            They sign in with this temporary password and can change it from their profile page.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── ADMIN DISCOUNTS ──────────────────────────────────────────────────────────
export function AdminDiscountsPage() {
  const discounts = trpc.admin.discounts.useQuery();
  const create = trpc.admin.createDiscount.useMutation({ onSuccess: () => discounts.refetch() });
  const del = trpc.admin.deleteDiscount.useMutation({ onSuccess: () => discounts.refetch() });
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 10,
    expirationDate: "",
    usageLimit: 100,
    minimumPurchase: 0,
  });

  return (
    <AdminLayout title="Discount codes">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="gnd-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-3">Code</th><th className="p-3">Type</th><th className="p-3">Value</th><th className="p-3">Usage</th><th className="p-3">Active</th><th className="p-3"></th></tr></thead>
            <tbody className="divide-y divide-border">
              {discounts.data?.map((d) => (
                <tr key={d.id}>
                  <td className="p-3 font-mono font-semibold">{d.code}</td>
                  <td className="p-3 capitalize">{d.type}</td>
                  <td className="p-3">{d.type === "percentage" ? `${d.value}%` : formatPrice(d.value)}</td>
                  <td className="p-3">{d.usageCount}{d.usageLimit ? `/${d.usageLimit}` : ""}</td>
                  <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{d.active ? "Yes" : "No"}</span></td>
                  <td className="p-3 text-right">
                    <button onClick={() => del.mutateAsync({ id: d.id })} className="px-3 h-8 rounded-md hover:bg-secondary text-sm text-destructive">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(discounts.data?.length ?? 0) === 0 && <div className="p-6 text-muted-foreground">No discount codes yet.</div>}
        </div>

        <div className="gnd-card p-5 space-y-3 h-fit">
          <h3 className="font-serif text-xl font-semibold">New discount</h3>
          <Field label="Code (e.g. SUMMER20)" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))} />
          <label className="block">
            <span className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Type</span>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))} className="w-full h-11 rounded-md border border-border bg-card px-3">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed amount (cents)</option>
            </select>
          </label>
          <Field label={form.type === "percentage" ? "Discount %" : "Discount (cents)"} value={String(form.value)} onChange={(v) => setForm((f) => ({ ...f, value: parseInt(v) || 0 }))} />
          <Field label="Usage limit" value={String(form.usageLimit)} onChange={(v) => setForm((f) => ({ ...f, usageLimit: parseInt(v) || 0 }))} />
          <Field label="Min purchase (cents, 0 = none)" value={String(form.minimumPurchase)} onChange={(v) => setForm((f) => ({ ...f, minimumPurchase: parseInt(v) || 0 }))} />
          <button
            onClick={async () => {
              if (!form.code) return toast.error("Enter a code");
              await create.mutateAsync({ code: form.code, type: form.type, value: form.value, usageLimit: form.usageLimit || null, minimumPurchase: form.minimumPurchase || null, expirationDate: form.expirationDate || null, active: true });
              setForm({ code: "", type: "percentage", value: 10, expirationDate: "", usageLimit: 100, minimumPurchase: 0 });
              toast.success("Discount created");
            }}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold"
          >
            Create discount
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── ADMIN CHATS ──────────────────────────────────────────────────────────────
export function AdminChatsPage() {
  const chats = trpc.admin.chats.useQuery();
  const [activeId, setActiveId] = useState<number | null>(null);
  const thread = trpc.admin.chatThread.useQuery(activeId ? { conversationId: activeId } : (undefined as any), { enabled: !!activeId });
  const reply = trpc.admin.replyToChat.useMutation({ onSuccess: () => { thread.refetch(); chats.refetch(); } });
  const close = trpc.admin.closeChat.useMutation({ onSuccess: () => { chats.refetch(); thread.refetch(); } });
  const [draft, setDraft] = useState("");

  return (
    <AdminLayout title="Customer messages">
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <div className="gnd-card divide-y divide-border h-fit">
          {(chats.data?.length ?? 0) === 0 && <div className="p-4 text-sm text-muted-foreground">No conversations yet.</div>}
          {chats.data?.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`block w-full text-left p-4 ${activeId === t.id ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-sm">{t.customerName}</div>
                <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full shrink-0 ${t.status === "open" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{t.status}</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{t.subject ?? "Conversation"}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(t.lastMessageAt).toLocaleString()}</div>
            </button>
          ))}
        </div>

        <div className="gnd-card p-5 min-h-[400px]">
          {!activeId ? (
            <div className="text-muted-foreground">Select a conversation.</div>
          ) : thread.isLoading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : thread.data ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl font-semibold">{thread.data.subject ?? "Conversation"}</h3>
                  <div className="text-sm text-muted-foreground">{thread.data.customerName} · {thread.data.customerEmail}</div>
                </div>
                <button
                  onClick={() => close.mutateAsync({ conversationId: activeId })}
                  className="px-3 h-9 rounded-md hover:bg-secondary text-sm"
                >
                  Close ticket
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {thread.data.messages.map((m: any) => (
                  <div key={m.id} className={`p-3 rounded-md ${m.senderRole === "owner" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <div className="text-xs uppercase font-semibold opacity-70 mb-1">{m.senderRole === "owner" ? "You (admin)" : "Customer"}</div>
                    <div className="text-sm whitespace-pre-line">{m.message}</div>
                    <div className="text-[10px] opacity-50 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); reply.mutateAsync({ conversationId: activeId, message: draft }).then(() => setDraft("")); } }}
                  placeholder="Type a reply… (Enter to send)"
                  className="flex-1 h-11 rounded-md border border-border bg-card px-3"
                />
                <button
                  onClick={() => reply.mutateAsync({ conversationId: activeId, message: draft }).then(() => setDraft(""))}
                  disabled={!draft.trim() || reply.isPending}
                  className="px-5 h-11 rounded-md bg-primary text-primary-foreground font-semibold disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── LEGAL PAGES ──────────────────────────────────────────────────────────────
export function TermsPage() {
  return (
    <PageShell>
      <section className="container py-12 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-semibold mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-foreground">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Overview</h2>
            <p className="text-muted-foreground">GameNest Designs provides board game organizers, inserts, and digital files. By using our site, you agree to these terms.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Products</h2>
            <p className="text-muted-foreground">All products are made using Bambu Lab 3D printers and ship within 2–3 business days. Digital files are delivered immediately upon payment.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Ordering</h2>
            <p className="text-muted-foreground">Orders are binding once placed. You agree to provide accurate shipping information. Prices are in USD and subject to change without notice.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
            <p className="text-muted-foreground">All designs and content on this site are owned by GameNest Designs. You may not reproduce, distribute, or sell our products without permission.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">GameNest Designs is not liable for indirect, incidental, or consequential damages. Our liability is limited to the purchase price of the product.</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function PrivacyPage() {
  return (
    <PageShell>
      <section className="container py-12 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-semibold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-foreground">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Information Collection</h2>
            <p className="text-muted-foreground">We collect name, email, phone, and shipping address to process orders. Payment information is handled by Stripe and is not stored on our servers.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Data Usage</h2>
            <p className="text-muted-foreground">We use your information to fulfill orders, send order updates, and respond to inquiries. We will not sell your data to third parties.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Cookies</h2>
            <p className="text-muted-foreground">We use cookies for authentication and session management. Your browser can be configured to decline cookies, but some features may not work properly.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Newsletter</h2>
            <p className="text-muted-foreground">You may opt in to our newsletter during signup. You can unsubscribe at any time by clicking the link in the email.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">5. Contact</h2>
            <p className="text-muted-foreground">For privacy questions, please use our <Link href="/contact" className="text-primary hover:underline">contact form</Link>.</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function RefundsPage() {
  return (
    <PageShell>
      <section className="container py-12 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-semibold mb-8">Refunds & Returns</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-foreground">
          <div>
            <h2 className="text-2xl font-semibold mb-3">1. Return Window</h2>
            <p className="text-muted-foreground">We offer a 30-day return window from the date of delivery. Items must be unused and in original packaging.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">2. Return Process</h2>
            <p className="text-muted-foreground">Contact us via our <Link href="/contact" className="text-primary hover:underline">contact form</Link> with your order number to request a return. We'll provide a return shipping label.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">3. Refunds</h2>
            <p className="text-muted-foreground">Once we receive and inspect the returned item, we'll process a refund within 7 business days. Refunds are issued to the original payment method.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">4. Damaged Items</h2>
            <p className="text-muted-foreground">If your item arrives damaged, contact us immediately with photos. We'll replace it or refund you at no cost.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">5. Digital Files</h2>
            <p className="text-muted-foreground">Digital downloads cannot be returned or refunded. Please review the preview before purchasing.</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
