import { useState, useEffect, useRef, useCallback } from "react";

// ─── Google Fonts ────────────────────────────────────────────────
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Unbounded:wght@400;700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --black: #0a0a0a;
      --white: #f0ede6;
      --red: #e63329;
      --red-dark: #b8271e;
      --gray: #1a1a1a;
      --gray2: #2a2a2a;
      --gray3: #444;
      --muted: #888;
      --font-display: 'Bebas Neue', sans-serif;
      --font-body: 'DM Mono', monospace;
      --font-brand: 'Unbounded', sans-serif;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--black); color: var(--white); font-family: var(--font-body); }
    input, select, button { font-family: var(--font-body); }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--black); }
    ::-webkit-scrollbar-thumb { background: var(--red); }
    ::selection { background: var(--red); color: var(--white); }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes cartBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
  `}</style>
);

// ─── Product Data ─────────────────────────────────────────────────
const INITIAL_PRODUCTS = [
  { id: 1, name: "VOID OVERSIZED TEE", category: "tees", price: 49, originalPrice: null,
    description: "280gsm heavyweight cotton. Pre-shrunk, garment-washed for that worn-in look from day one.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    sizes: ["XS","S","M","L","XL","2XL"], stock: { XS:3, S:8, M:12, L:10, XL:5, "2XL":2 },
    tags: ["bestseller"], color: "Black" },
  { id: 2, name: "SIGNAL HOODIE", category: "hoodies", price: 89, originalPrice: 110,
    description: "450gsm french terry. Kangaroo pocket, ribbed cuffs. A forever piece.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    sizes: ["S","M","L","XL","2XL"], stock: { S:4, M:9, L:7, XL:3, "2XL":1 },
    tags: ["sale"], color: "Charcoal" },
  { id: 3, name: "STATIC CAP", category: "accessories", price: 35, originalPrice: null,
    description: "6-panel structured cap. Embroidered logo, adjustable snapback.",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
    sizes: ["ONE SIZE"], stock: { "ONE SIZE": 20 },
    tags: ["new"], color: "Cream" },
  { id: 4, name: "FREQUENCY JOGGERS", category: "bottoms", price: 75, originalPrice: null,
    description: "360gsm fleece. Tapered fit, contrast taping, deep side pockets.",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
    sizes: ["S","M","L","XL"], stock: { S:6, M:11, L:8, XL:2 },
    tags: [], color: "Black" },
  { id: 5, name: "NOISE TEE VOL.2", category: "tees", price: 55, originalPrice: null,
    description: "All-over print. 200gsm jersey. Boxy cut, dropped shoulders.",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    sizes: ["S","M","L","XL","2XL"], stock: { S:2, M:5, L:7, XL:4, "2XL":1 },
    tags: ["new","bestseller"], color: "White" },
  { id: 6, name: "DEAD CHANNEL TOTE", category: "accessories", price: 28, originalPrice: null,
    description: "16oz canvas. Reinforced handles. Interior zip pocket.",
    image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600&q=80",
    sizes: ["ONE SIZE"], stock: { "ONE SIZE": 30 },
    tags: [], color: "Natural" },
  { id: 7, name: "COLD WAVE JACKET", category: "outerwear", price: 149, originalPrice: 180,
    description: "Wind and water-resistant shell. Mesh lining, internal pockets. YKK zips.",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    sizes: ["S","M","L","XL"], stock: { S:3, M:4, L:3, XL:2 },
    tags: ["sale"], color: "Olive" },
  { id: 8, name: "PHANTOM CREWNECK", category: "hoodies", price: 79, originalPrice: null,
    description: "400gsm cotton fleece. Ribbed collar and hem. Minimal embroidery.",
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=600&q=80",
    sizes: ["XS","S","M","L","XL"], stock: { XS:2, S:6, M:10, L:8, XL:3 },
    tags: ["new"], color: "Smoke" },
];

const SHIPPING_OPTIONS = [
  { id: "standard", label: "Standard Shipping", days: "5–7 business days", price: 5.99 },
  { id: "express", label: "Express Shipping", days: "2–3 business days", price: 12.99 },
  { id: "overnight", label: "Overnight", days: "Next business day", price: 24.99 },
];

const TAX_RATE = 0.08;

// ─── Utilities ────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n).toFixed(2)}`;
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();

// ─── Toast System ─────────────────────────────────────────────────
function Toasts({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999, display:"flex", flexDirection:"column", gap:8 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: t.type === "error" ? "#b8271e" : t.type === "success" ? "#1a5e1a" : "#1a1a1a",
          border: `1px solid ${t.type === "error" ? "#e63329" : t.type === "success" ? "#2a8a2a" : "#444"}`,
          color: "#f0ede6", padding: "12px 16px", fontFamily:"var(--font-body)", fontSize:12,
          letterSpacing:"0.05em", cursor:"pointer", maxWidth:280, animation:"slideIn 0.3s ease",
          lineHeight:1.5
        }}>
          <span style={{color: t.type==="success"?"#4ade80":t.type==="error"?"#fca5a5":"#888", marginRight:8}}>
            {t.type==="success"?"✓":t.type==="error"?"✕":"ℹ"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type="info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const remove = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, add, remove };
}

// ─── Auth Modal ───────────────────────────────────────────────────
function AuthModal({ mode, setMode, onClose, onAuth, toast }) {
  const [form, setForm] = useState({ email:"", password:"", name:"" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}));

  const submit = async () => {
    if (!form.email || !form.password) return toast("Fill all fields", "error");
    if (mode === "register" && !form.name) return toast("Enter your name", "error");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const user = { id: uid(), email: form.email, name: form.name || form.email.split("@")[0], orders: [] };
    onAuth(user);
    toast(`Welcome${mode==="register"?" to the family":""}, ${user.name}!`, "success");
    onClose();
    setLoading(false);
  };

  const inp = { background:"#111", border:"1px solid #333", color:"#f0ede6", padding:"10px 14px",
    fontFamily:"var(--font-body)", fontSize:12, letterSpacing:"0.05em", width:"100%", outline:"none" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", animation:"fadeIn 0.2s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#111", border:"1px solid #2a2a2a", padding:40, width:360,
        animation:"slideUp 0.3s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
          <span style={{ fontFamily:"var(--font-brand)", fontSize:14, letterSpacing:"0.1em" }}>
            {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:18 }}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {mode === "register" && (
            <input style={inp} placeholder="FULL NAME" value={form.name} onChange={set("name")} />
          )}
          <input style={inp} type="email" placeholder="EMAIL" value={form.email} onChange={set("email")} />
          <input style={inp} type="password" placeholder="PASSWORD" value={form.password} onChange={set("password")} />
          <button onClick={submit} disabled={loading} style={{
            background: loading ? "#333" : "var(--red)", color:"#fff", border:"none",
            padding:"12px 24px", fontFamily:"var(--font-brand)", fontSize:11, letterSpacing:"0.15em",
            cursor: loading ? "default" : "pointer", marginTop:8, transition:"background 0.2s"
          }}>
            {loading ? "LOADING..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={{
            background:"none", border:"none", color:"var(--muted)", fontSize:11,
            fontFamily:"var(--font-body)", cursor:"pointer", letterSpacing:"0.05em", marginTop:4
          }}>
            {mode === "login" ? "Don't have an account? Register →" : "Already have an account? Sign in →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────
function CartSidebar({ cart, products, onClose, onUpdate, onRemove, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500 }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.7)" }} />
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:400, background:"#0f0f0f",
        borderLeft:"1px solid #2a2a2a", display:"flex", flexDirection:"column", animation:"slideIn 0.3s ease" }}>
        <div style={{ padding:"24px 28px", borderBottom:"1px solid #1a1a1a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"var(--font-brand)", fontSize:13, letterSpacing:"0.1em" }}>
            CART ({count})
          </span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:18 }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"16px 28px" }}>
          {cart.length === 0 ? (
            <div style={{ color:"#555", textAlign:"center", marginTop:80, fontSize:12, letterSpacing:"0.1em" }}>
              YOUR CART IS EMPTY
            </div>
          ) : cart.map(item => (
            <div key={`${item.id}-${item.size}`} style={{ display:"flex", gap:14, marginBottom:20, paddingBottom:20, borderBottom:"1px solid #1a1a1a" }}>
              <img src={item.image} alt={item.name} style={{ width:72, height:72, objectFit:"cover", flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"var(--font-brand)", fontSize:11, letterSpacing:"0.08em", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
                <div style={{ color:"#888", fontSize:11, marginBottom:8 }}>Size: {item.size}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <button onClick={() => onUpdate(item, Math.max(0, item.qty - 1))} style={{ background:"#222", border:"none", color:"#f0ede6", width:24, height:24, cursor:"pointer", fontSize:14 }}>−</button>
                  <span style={{ fontSize:12, width:20, textAlign:"center" }}>{item.qty}</span>
                  <button onClick={() => onUpdate(item, item.qty + 1)} style={{ background:"#222", border:"none", color:"#f0ede6", width:24, height:24, cursor:"pointer", fontSize:14 }}>+</button>
                  <button onClick={() => onRemove(item)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:11, marginLeft:"auto" }}>REMOVE</button>
                </div>
              </div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:18, flexShrink:0 }}>{fmt(item.price * item.qty)}</div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding:"20px 28px", borderTop:"1px solid #1a1a1a" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:11, color:"#888" }}>
              <span>SUBTOTAL</span><span>{fmt(total)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:11, color:"#888" }}>
              <span>TAX (8%)</span><span>{fmt(total * TAX_RATE)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20, fontFamily:"var(--font-display)", fontSize:22 }}>
              <span>TOTAL</span><span>{fmt(total + total * TAX_RATE)}</span>
            </div>
            <button onClick={onCheckout} style={{
              background:"var(--red)", color:"#fff", border:"none", width:"100%",
              padding:"14px", fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em",
              cursor:"pointer", transition:"background 0.2s"
            }}
              onMouseEnter={e => e.target.style.background="#b8271e"}
              onMouseLeave={e => e.target.style.background="var(--red)"}
            >
              CHECKOUT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────
function ProductCard({ product, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [hover, setHover] = useState(false);
  const totalStock = Object.values(product.stock).reduce((a, b) => a + b, 0);

  const handleAdd = () => {
    if (product.sizes.length > 1 && !selectedSize) return;
    onAddToCart(product, selectedSize || product.sizes[0]);
  };

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background:"#111", border:`1px solid ${hover?"#333":"#1a1a1a"}`, transition:"all 0.3s", position:"relative", animation:"slideUp 0.4s ease" }}>
      {product.tags.includes("sale") && (
        <div style={{ position:"absolute", top:12, left:12, background:"var(--red)", color:"#fff",
          fontFamily:"var(--font-brand)", fontSize:10, letterSpacing:"0.1em", padding:"3px 8px", zIndex:1 }}>SALE</div>
      )}
      {product.tags.includes("new") && (
        <div style={{ position:"absolute", top:12, left:12, background:"#f0ede6", color:"#0a0a0a",
          fontFamily:"var(--font-brand)", fontSize:10, letterSpacing:"0.1em", padding:"3px 8px", zIndex:1 }}>NEW</div>
      )}
      {product.tags.includes("bestseller") && !product.tags.includes("new") && (
        <div style={{ position:"absolute", top:12, left:12, background:"transparent", color:"#888", border:"1px solid #444",
          fontFamily:"var(--font-body)", fontSize:10, letterSpacing:"0.05em", padding:"3px 8px", zIndex:1 }}>★ BEST</div>
      )}
      {totalStock === 0 && (
        <div style={{ position:"absolute", inset:0, background:"rgba(10,10,10,0.7)", display:"flex",
          alignItems:"center", justifyContent:"center", zIndex:2 }}>
          <span style={{ fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em", color:"#888" }}>SOLD OUT</span>
        </div>
      )}
      <div style={{ overflow:"hidden", height:280 }}>
        <img src={product.image} alt={product.name} style={{ width:"100%", height:"100%", objectFit:"cover",
          transform: hover ? "scale(1.05)" : "scale(1)", transition:"transform 0.5s ease" }} />
      </div>
      <div style={{ padding:"16px" }}>
        <div style={{ fontFamily:"var(--font-brand)", fontSize:11, letterSpacing:"0.08em", marginBottom:4,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{product.name}</div>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
          <span style={{ fontFamily:"var(--font-display)", fontSize:22 }}>{fmt(product.price)}</span>
          {product.originalPrice && <span style={{ color:"#666", fontSize:11, textDecoration:"line-through" }}>{fmt(product.originalPrice)}</span>}
        </div>
        {product.sizes.length > 1 && (
          <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
            {product.sizes.map(s => {
              const avail = product.stock[s] > 0;
              return (
                <button key={s} onClick={() => setSelectedSize(s)} style={{
                  background: selectedSize === s ? "#f0ede6" : "transparent",
                  color: selectedSize === s ? "#0a0a0a" : avail ? "#888" : "#333",
                  border: `1px solid ${selectedSize === s ? "#f0ede6" : avail ? "#333" : "#1a1a1a"}`,
                  padding:"3px 8px", fontSize:10, fontFamily:"var(--font-body)", cursor: avail ? "pointer" : "default",
                  letterSpacing:"0.05em", textDecoration: !avail ? "line-through" : "none",
                  transition:"all 0.15s"
                }}>{s}</button>
              );
            })}
          </div>
        )}
        <button onClick={handleAdd} disabled={totalStock === 0 || (product.sizes.length > 1 && !selectedSize)}
          style={{
            background: (totalStock === 0 || (product.sizes.length > 1 && !selectedSize)) ? "#1a1a1a" : "var(--red)",
            color: (totalStock === 0 || (product.sizes.length > 1 && !selectedSize)) ? "#444" : "#fff",
            border:"none", width:"100%", padding:"10px", fontFamily:"var(--font-brand)",
            fontSize:11, letterSpacing:"0.15em", cursor: (totalStock === 0) ? "default" : "pointer",
            transition:"background 0.2s"
          }}
          onMouseEnter={e => { if(totalStock > 0 && (product.sizes.length === 1 || selectedSize)) e.target.style.background = "#b8271e"; }}
          onMouseLeave={e => { if(totalStock > 0 && (product.sizes.length === 1 || selectedSize)) e.target.style.background = "var(--red)"; }}
        >
          {product.sizes.length > 1 && !selectedSize ? "SELECT SIZE" : totalStock === 0 ? "SOLD OUT" : "ADD TO CART"}
        </button>
      </div>
    </div>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────
function Marquee() {
  const items = ["FREE SHIPPING OVER $100","WORLDWIDE DELIVERY","PREMIUM QUALITY GUARANTEED","NEW DROP AVAILABLE NOW","SUSTAINABLY SOURCED MATERIALS"];
  const text = items.join("  ·  ") + "  ·  " + items.join("  ·  ");
  return (
    <div style={{ background:"var(--red)", overflow:"hidden", height:36, display:"flex", alignItems:"center" }}>
      <div style={{ whiteSpace:"nowrap", animation:"marquee 30s linear infinite",
        fontFamily:"var(--font-brand)", fontSize:10, letterSpacing:"0.15em", color:"#fff" }}>
        {text}
      </div>
    </div>
  );
}

// ─── Shop Page ────────────────────────────────────────────────────
function ShopPage({ products, onAddToCart, user, onOpenAuth, onOpenCart, cartCount, orders, onOpenAdmin }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [priceMax, setPriceMax] = useState(200);

  const categories = ["all", "tees", "hoodies", "bottoms", "outerwear", "accessories"];

  const filtered = products
    .filter(p => category === "all" || p.category === category)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    .filter(p => p.price <= priceMax)
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const inpStyle = {
    background:"#111", border:"1px solid #2a2a2a", color:"#f0ede6",
    padding:"10px 14px", fontFamily:"var(--font-body)", fontSize:11,
    letterSpacing:"0.05em", outline:"none", transition:"border-color 0.2s"
  };

  return (
    <div>
      {/* Hero */}
      <div style={{ position:"relative", height:"70vh", minHeight:400, display:"flex", alignItems:"flex-end", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)" }}>
          <div style={{ position:"absolute", inset:0, opacity:0.08,
            backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 40px,#e63329 40px,#e63329 41px), repeating-linear-gradient(90deg,transparent,transparent 40px,#e63329 40px,#e63329 41px)" }} />
        </div>
        <div style={{ position:"relative", padding:"0 48px 60px", maxWidth:900 }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"clamp(72px,12vw,160px)", lineHeight:0.85,
            color:"var(--white)", letterSpacing:"0.02em", animation:"slideUp 0.8s ease" }}>
            THE NEW<br/>
            <span style={{ color:"var(--red)", WebkitTextStroke:"2px var(--red)", color:"transparent" }}>MERCH</span><br/>
            DROP
          </div>
          <div style={{ marginTop:24, color:"#888", fontFamily:"var(--font-body)", fontSize:12,
            letterSpacing:"0.1em", animation:"slideUp 1s ease" }}>
            SEASON 04 — LIMITED QUANTITIES
          </div>
        </div>
        <div style={{ position:"absolute", bottom:30, right:48, fontFamily:"var(--font-display)", fontSize:18, color:"#333" }}>
          {products.length} PIECES
        </div>
      </div>
      <Marquee />

      {/* Search & Filters */}
      <div style={{ padding:"32px 48px", borderBottom:"1px solid #1a1a1a", background:"#0d0d0d" }}>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
          <input
            style={{ ...inpStyle, flex:"1 1 200px", minWidth:200 }}
            placeholder="SEARCH PRODUCTS..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => e.target.style.borderColor = "#e63329"}
            onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />
          <select style={{ ...inpStyle, flex:"0 0 auto" }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">SORT: DEFAULT</option>
            <option value="price-asc">PRICE: LOW → HIGH</option>
            <option value="price-desc">PRICE: HIGH → LOW</option>
            <option value="name">NAME: A→Z</option>
          </select>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"#888" }}>
            <span>MAX: {fmt(priceMax)}</span>
            <input type="range" min={20} max={200} value={priceMax} onChange={e => setPriceMax(+e.target.value)}
              style={{ accentColor:"var(--red)", width:80 }} />
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              background: category === c ? "#f0ede6" : "transparent",
              color: category === c ? "#0a0a0a" : "#666",
              border: `1px solid ${category === c ? "#f0ede6" : "#333"}`,
              padding:"5px 14px", fontFamily:"var(--font-brand)", fontSize:10, letterSpacing:"0.1em",
              cursor:"pointer", transition:"all 0.2s", textTransform:"uppercase"
            }}>{c}</button>
          ))}
          <span style={{ marginLeft:"auto", fontSize:11, color:"#555", alignSelf:"center" }}>{filtered.length} RESULTS</span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding:"40px 48px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0", color:"#555", fontFamily:"var(--font-display)", fontSize:32, letterSpacing:"0.1em" }}>
            NO PRODUCTS FOUND
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:1, background:"#1a1a1a" }}>
            {filtered.map(p => (
              <div key={p.id} style={{ background:"#0a0a0a" }}>
                <ProductCard product={p} onAddToCart={onAddToCart} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order History (if logged in) */}
      {user && orders.filter(o => o.userId === user.id).length > 0 && (
        <div style={{ padding:"40px 48px", borderTop:"1px solid #1a1a1a" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:32, letterSpacing:"0.05em", marginBottom:24 }}>YOUR ORDERS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {orders.filter(o => o.userId === user.id).map(order => (
              <div key={order.id} style={{ background:"#111", border:"1px solid #1a1a1a", padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontFamily:"var(--font-brand)", fontSize:11, letterSpacing:"0.1em", marginBottom:4 }}>ORDER #{order.id}</div>
                  <div style={{ color:"#888", fontSize:11 }}>{order.date} · {order.items.length} items</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:24 }}>
                  <span style={{ fontSize:11, padding:"3px 10px", border:`1px solid ${order.status==="Delivered"?"#2a8a2a":order.status==="Processing"?"#e6aa29":"#444"}`,
                    color:order.status==="Delivered"?"#4ade80":order.status==="Processing"?"#fbbf24":"#888" }}>
                    {order.status}
                  </span>
                  <span style={{ fontFamily:"var(--font-display)", fontSize:20 }}>{fmt(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding:"40px 48px", borderTop:"1px solid #1a1a1a", display:"flex", justifyContent:"space-between",
        alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div style={{ fontFamily:"var(--font-brand)", fontSize:16, letterSpacing:"0.15em" }}>VOID MERCH</div>
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy Policy","Terms of Service","Contact","Returns"].map(l => (
            <span key={l} style={{ fontSize:10, color:"#555", letterSpacing:"0.05em", cursor:"pointer" }}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize:10, color:"#333" }}>© 2025 VOID MERCH. ALL RIGHTS RESERVED.</div>
      </footer>
    </div>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────
function CheckoutPage({ cart, products, user, onPlaceOrder, onBack, toast }) {
  const [step, setStep] = useState("info"); // info → shipping → payment → confirm
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || "", email: user?.email || "",
    address: "", city: "", state: "", zip: "", country: "US",
  });
  const [shipping, setShipping] = useState("standard");
  const [payment, setPayment] = useState({ card:"", expiry:"", cvv:"", name:"" });
  const [loading, setLoading] = useState(false);

  const shippingCost = SHIPPING_OPTIONS.find(s => s.id === shipping)?.price || 5.99;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + shippingCost;

  const setF = (k) => (e) => setForm(p => ({...p, [k]: e.target.value}));
  const setP = (k) => (e) => {
    let v = e.target.value;
    if (k === "card") v = v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
    if (k === "expiry") v = v.replace(/\D/g,"").slice(0,4).replace(/(.{2})/,"$1/").slice(0,5);
    if (k === "cvv") v = v.replace(/\D/g,"").slice(0,4);
    setPayment(p => ({...p, [k]: v}));
  };

  const placeOrder = async () => {
    if (!payment.card || !payment.expiry || !payment.cvv || !payment.name) {
      return toast("Please fill all payment fields", "error");
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const newOrder = {
      id: uid(), userId: user?.id || "guest",
      date: new Date().toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" }),
      items: [...cart], subtotal, tax, shippingCost, total,
      shipping: form, shippingMethod: SHIPPING_OPTIONS.find(s => s.id === shipping),
      status: "Processing", paymentLast4: payment.card.replace(/\s/g,"").slice(-4)
    };
    onPlaceOrder(newOrder);
    setOrder(newOrder);
    setStep("confirm");
    setLoading(false);
    toast(`Order #${newOrder.id} confirmed! Processing email sent.`, "success");
  };

  const inpStyle = (v) => ({
    background:"#111", border:`1px solid ${v?"#333":"#2a2a2a"}`, color:"#f0ede6",
    padding:"11px 14px", fontFamily:"var(--font-body)", fontSize:12, letterSpacing:"0.04em",
    outline:"none", transition:"border-color 0.2s", width:"100%"
  });

  const steps = ["info","shipping","payment","confirm"];
  const stepLabels = ["CONTACT & SHIPPING INFO","DELIVERY METHOD","PAYMENT","CONFIRMATION"];
  const stepIdx = steps.indexOf(step);

  if (cart.length === 0 && step !== "confirm") {
    return (
      <div style={{ minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:48, color:"#333" }}>CART IS EMPTY</div>
        <button onClick={onBack} style={{ background:"var(--red)", color:"#fff", border:"none", padding:"12px 32px",
          fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em", cursor:"pointer" }}>← BACK TO SHOP</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", padding:"40px 48px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
        <div style={{ fontFamily:"var(--font-display)", fontSize:40, letterSpacing:"0.05em" }}>CHECKOUT</div>
        {step !== "confirm" && (
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#888", fontSize:12,
            fontFamily:"var(--font-body)", cursor:"pointer", letterSpacing:"0.05em" }}>← BACK TO SHOP</button>
        )}
      </div>

      {/* Progress */}
      {step !== "confirm" && (
        <div style={{ display:"flex", gap:0, marginBottom:40 }}>
          {["INFO","SHIPPING","PAYMENT"].map((s, i) => (
            <div key={s} style={{ flex:1, display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:"50%",
                  background: i <= stepIdx ? "var(--red)" : "#222", border:`1px solid ${i <= stepIdx?"var(--red)":"#333"}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"var(--font-brand)", fontSize:10, color: i <= stepIdx?"#fff":"#555", transition:"all 0.3s"
                }}>{i < stepIdx ? "✓" : i+1}</div>
                <span style={{ fontSize:10, fontFamily:"var(--font-brand)", letterSpacing:"0.1em",
                  color: i <= stepIdx ? "#f0ede6" : "#555" }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex:1, height:1, background: i < stepIdx?"var(--red)":"#222", margin:"0 12px", transition:"background 0.3s" }} />}
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns: step === "confirm" ? "1fr" : "1fr 360px", gap:40, alignItems:"start" }}>
        {/* Left: Form */}
        <div>
          {/* STEP: Info */}
          {step === "info" && (
            <div style={{ animation:"slideUp 0.3s ease" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:24, letterSpacing:"0.05em", marginBottom:24 }}>CONTACT & SHIPPING INFO</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[["name","FULL NAME"],["email","EMAIL ADDRESS"]].map(([k,p]) => (
                  <input key={k} placeholder={p} value={form[k]} onChange={setF(k)}
                    style={{ ...inpStyle(form[k]), gridColumn: k==="email"?"1/-1":undefined }}
                    onFocus={e => e.target.style.borderColor="#e63329"}
                    onBlur={e => e.target.style.borderColor=form[k]?"#333":"#2a2a2a"} />
                ))}
                <input placeholder="STREET ADDRESS" value={form.address} onChange={setF("address")}
                  style={{ ...inpStyle(form.address), gridColumn:"1/-1" }}
                  onFocus={e => e.target.style.borderColor="#e63329"}
                  onBlur={e => e.target.style.borderColor=form.address?"#333":"#2a2a2a"} />
                {[["city","CITY"],["state","STATE"],["zip","ZIP CODE"]].map(([k,p]) => (
                  <input key={k} placeholder={p} value={form[k]} onChange={setF(k)}
                    style={inpStyle(form[k])}
                    onFocus={e => e.target.style.borderColor="#e63329"}
                    onBlur={e => e.target.style.borderColor=form[k]?"#333":"#2a2a2a"} />
                ))}
                <select value={form.country} onChange={setF("country")} style={inpStyle(true)}>
                  {[["US","United States"],["GB","United Kingdom"],["CA","Canada"],["AU","Australia"],["DE","Germany"],["FR","France"]].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => {
                if (!form.name || !form.email || !form.address || !form.city || !form.zip) return toast("Fill all required fields", "error");
                setStep("shipping");
              }} style={{ marginTop:24, background:"var(--red)", color:"#fff", border:"none", padding:"14px 40px",
                fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em", cursor:"pointer" }}>
                CONTINUE TO SHIPPING →
              </button>
            </div>
          )}

          {/* STEP: Shipping */}
          {step === "shipping" && (
            <div style={{ animation:"slideUp 0.3s ease" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:24, letterSpacing:"0.05em", marginBottom:24 }}>DELIVERY METHOD</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {SHIPPING_OPTIONS.map(opt => (
                  <label key={opt.id} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 20px",
                    background:"#111", border:`1px solid ${shipping===opt.id?"var(--red)":"#1a1a1a"}`,
                    cursor:"pointer", transition:"border-color 0.2s" }}>
                    <input type="radio" value={opt.id} checked={shipping===opt.id} onChange={() => setShipping(opt.id)}
                      style={{ accentColor:"var(--red)" }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.08em", marginBottom:4 }}>{opt.label}</div>
                      <div style={{ color:"#888", fontSize:11 }}>{opt.days}</div>
                    </div>
                    <div style={{ fontFamily:"var(--font-display)", fontSize:20 }}>
                      {opt.price === 0 ? "FREE" : fmt(opt.price)}
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ display:"flex", gap:12, marginTop:24 }}>
                <button onClick={() => setStep("info")} style={{ background:"transparent", color:"#888", border:"1px solid #333",
                  padding:"14px 28px", fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em", cursor:"pointer" }}>← BACK</button>
                <button onClick={() => setStep("payment")} style={{ background:"var(--red)", color:"#fff", border:"none",
                  padding:"14px 40px", fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em", cursor:"pointer" }}>
                  CONTINUE TO PAYMENT →
                </button>
              </div>
            </div>
          )}

          {/* STEP: Payment */}
          {step === "payment" && (
            <div style={{ animation:"slideUp 0.3s ease" }}>
              <div style={{ fontFamily:"var(--font-display)", fontSize:24, letterSpacing:"0.05em", marginBottom:8 }}>PAYMENT</div>
              <div style={{ color:"#888", fontSize:11, marginBottom:24, display:"flex", gap:8, alignItems:"center" }}>
                <span>🔒</span> SECURE CHECKOUT — SSL ENCRYPTED
              </div>
              {/* Mock card visual */}
              <div style={{ background:"linear-gradient(135deg, #1a0505 0%, #2a0a0a 100%)", border:"1px solid #3a1010",
                padding:"24px 28px", marginBottom:24, height:160, display:"flex", flexDirection:"column",
                justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", right:-20, top:-20, width:120, height:120, borderRadius:"50%",
                  background:"rgba(230,51,41,0.1)" }} />
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.1em", color:"#e63329" }}>VOID MERCH</span>
                  <span style={{ color:"#888", fontSize:11 }}>VISA / MC</span>
                </div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:22, letterSpacing:"0.2em", color:"#f0ede6" }}>
                  {(payment.card || "•••• •••• •••• ••••").padEnd(19,"•")}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontSize:9, color:"#888", letterSpacing:"0.1em" }}>CARDHOLDER</div>
                    <div style={{ fontSize:12, letterSpacing:"0.05em" }}>{payment.name || "YOUR NAME"}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:9, color:"#888", letterSpacing:"0.1em" }}>EXPIRES</div>
                    <div style={{ fontSize:12 }}>{payment.expiry || "MM/YY"}</div>
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <input placeholder="CARD NUMBER" value={payment.card} onChange={setP("card")}
                  style={{ ...inpStyle(payment.card), gridColumn:"1/-1" }}
                  onFocus={e => e.target.style.borderColor="#e63329"}
                  onBlur={e => e.target.style.borderColor=payment.card?"#333":"#2a2a2a"} />
                <input placeholder="CARDHOLDER NAME" value={payment.name} onChange={setP("name")}
                  style={{ ...inpStyle(payment.name), gridColumn:"1/-1" }}
                  onFocus={e => e.target.style.borderColor="#e63329"}
                  onBlur={e => e.target.style.borderColor=payment.name?"#333":"#2a2a2a"} />
                <input placeholder="MM/YY" value={payment.expiry} onChange={setP("expiry")}
                  style={inpStyle(payment.expiry)}
                  onFocus={e => e.target.style.borderColor="#e63329"}
                  onBlur={e => e.target.style.borderColor=payment.expiry?"#333":"#2a2a2a"} />
                <input placeholder="CVV" value={payment.cvv} onChange={setP("cvv")}
                  style={inpStyle(payment.cvv)}
                  onFocus={e => e.target.style.borderColor="#e63329"}
                  onBlur={e => e.target.style.borderColor=payment.cvv?"#333":"#2a2a2a"} />
              </div>
              <div style={{ display:"flex", gap:12, marginTop:24 }}>
                <button onClick={() => setStep("shipping")} style={{ background:"transparent", color:"#888", border:"1px solid #333",
                  padding:"14px 28px", fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em", cursor:"pointer" }}>← BACK</button>
                <button onClick={placeOrder} disabled={loading} style={{
                  background: loading ? "#333" : "var(--red)", color:"#fff", border:"none",
                  padding:"14px 40px", fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em",
                  cursor: loading ? "default" : "pointer", display:"flex", alignItems:"center", gap:8
                }}>
                  {loading ? <><span style={{ display:"inline-block", width:14, height:14, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} /> PROCESSING...</> : `PLACE ORDER — ${fmt(total)}`}
                </button>
              </div>
            </div>
          )}

          {/* STEP: Confirm */}
          {step === "confirm" && order && (
            <div style={{ animation:"slideUp 0.4s ease", textAlign:"center", padding:"40px 0" }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid #2a8a2a",
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:36 }}>✓</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:48, letterSpacing:"0.05em", marginBottom:8 }}>ORDER CONFIRMED</div>
              <div style={{ color:"#888", fontSize:12, letterSpacing:"0.1em", marginBottom:32 }}>
                ORDER #{order.id} · CONFIRMATION EMAIL SENT TO {order.shipping.email}
              </div>
              <div style={{ background:"#111", border:"1px solid #1a1a1a", padding:24, marginBottom:32, textAlign:"left" }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:18, marginBottom:16 }}>ORDER SUMMARY</div>
                {order.items.map(item => (
                  <div key={`${item.id}-${item.size}`} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:12, color:"#888" }}>
                    <span>{item.name} × {item.qty} ({item.size})</span>
                    <span style={{ color:"#f0ede6" }}>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
                <div style={{ borderTop:"1px solid #1a1a1a", marginTop:16, paddingTop:16 }}>
                  {[["Subtotal",fmt(order.subtotal)],["Shipping ("+order.shippingMethod?.label+")",fmt(order.shippingCost)],["Tax",fmt(order.tax)]].map(([l,v]) => (
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#888", marginBottom:6 }}>
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"var(--font-display)", fontSize:24, marginTop:8 }}>
                    <span>TOTAL</span><span>{fmt(order.total)}</span>
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:24 }}>
                {["Processing","Confirmed","Shipped","Delivered"].map((s,i) => (
                  <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background: i===0?"#fbbf24":"#333" }} />
                    <span style={{ fontSize:10, color: i===0?"#fbbf24":"#555", fontFamily:"var(--font-body)", letterSpacing:"0.05em" }}>{s}</span>
                    {i<3 && <div style={{ width:20, height:1, background:"#222" }} />}
                  </div>
                ))}
              </div>
              <button onClick={onBack} style={{ background:"var(--red)", color:"#fff", border:"none", padding:"14px 40px",
                fontFamily:"var(--font-brand)", fontSize:12, letterSpacing:"0.15em", cursor:"pointer" }}>
                CONTINUE SHOPPING
              </button>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        {step !== "confirm" && (
          <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", padding:24, position:"sticky", top:20 }}>
            <div style={{ fontFamily:"var(--font-display)", fontSize:22, letterSpacing:"0.05em", marginBottom:20 }}>ORDER SUMMARY</div>
            <div style={{ maxHeight:280, overflowY:"auto", marginBottom:20 }}>
              {cart.map(item => (
                <div key={`${item.id}-${item.size}`} style={{ display:"flex", gap:12, marginBottom:14 }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <img src={item.image} alt={item.name} style={{ width:60, height:60, objectFit:"cover" }} />
                    <div style={{ position:"absolute", top:-6, right:-6, width:20, height:20, borderRadius:"50%",
                      background:"var(--red)", display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:10, fontFamily:"var(--font-brand)" }}>{item.qty}</div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:11, fontFamily:"var(--font-brand)", letterSpacing:"0.06em", marginBottom:2,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
                    <div style={{ color:"#888", fontSize:10 }}>Size: {item.size}</div>
                  </div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:16, flexShrink:0 }}>{fmt(item.price * item.qty)}</div>
                </div>
              ))}
            </div>
            {[["Subtotal",fmt(subtotal)],["Shipping",fmt(shippingCost)],["Tax (8%)",fmt(tax)]].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#888", marginBottom:8 }}>
                <span>{l}</span><span style={{ color:"#f0ede6" }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop:"1px solid #2a2a2a", marginTop:12, paddingTop:12,
              display:"flex", justifyContent:"space-between", fontFamily:"var(--font-display)", fontSize:28 }}>
              <span>TOTAL</span><span>{fmt(total)}</span>
            </div>
            {subtotal >= 100 && (
              <div style={{ marginTop:12, fontSize:10, color:"#4ade80", letterSpacing:"0.05em" }}>
                ✓ FREE SHIPPING APPLIED (ORDERS OVER $100)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────
function AdminDashboard({ products, orders, onClose, onUpdateStock }) {
  const [tab, setTab] = useState("overview");
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const topProduct = products.sort((a, b) => {
    const aSales = orders.flatMap(o => o.items).filter(i => i.id === a.id).reduce((s,i) => s+i.qty, 0);
    const bSales = orders.flatMap(o => o.items).filter(i => i.id === b.id).reduce((s,i) => s+i.qty, 0);
    return bSales - aSales;
  })[0];

  return (
    <div style={{ position:"fixed", inset:0, background:"#080808", zIndex:800, overflowY:"auto", animation:"fadeIn 0.2s ease" }}>
      <div style={{ padding:"28px 40px", borderBottom:"1px solid #1a1a1a", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          <span style={{ fontFamily:"var(--font-brand)", fontSize:14, letterSpacing:"0.15em" }}>ADMIN PANEL</span>
          {["overview","products","orders"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background:"none", border:"none", color: tab===t?"var(--red)":"#555", fontFamily:"var(--font-body)",
              fontSize:11, letterSpacing:"0.1em", cursor:"pointer", textTransform:"uppercase",
              borderBottom: tab===t?"1px solid var(--red)":"1px solid transparent", paddingBottom:2
            }}>{t}</button>
          ))}
        </div>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:18 }}>✕ CLOSE</button>
      </div>

      <div style={{ padding:"32px 40px" }}>
        {tab === "overview" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:40 }}>
              {[
                ["TOTAL REVENUE", fmt(totalRevenue), "↑ simulated"],
                ["TOTAL ORDERS", totalOrders, "since launch"],
                ["AVG ORDER VALUE", fmt(avgOrder), "per transaction"],
                ["PRODUCTS", products.length, `${products.filter(p=>Object.values(p.stock).reduce((a,b)=>a+b,0)===0).length} sold out`],
              ].map(([label, val, sub]) => (
                <div key={label} style={{ background:"#111", border:"1px solid #1a1a1a", padding:"20px 24px" }}>
                  <div style={{ fontSize:10, color:"#888", letterSpacing:"0.1em", marginBottom:8 }}>{label}</div>
                  <div style={{ fontFamily:"var(--font-display)", fontSize:32, marginBottom:4 }}>{val}</div>
                  <div style={{ fontSize:10, color:"#555" }}>{sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              <div style={{ background:"#111", border:"1px solid #1a1a1a", padding:24 }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:18, marginBottom:20 }}>RECENT ORDERS</div>
                {orders.length === 0 ? <div style={{ color:"#555", fontSize:11 }}>No orders yet</div> :
                  orders.slice(-5).reverse().map(o => (
                    <div key={o.id} style={{ display:"flex", justifyContent:"space-between", paddingBottom:12, marginBottom:12, borderBottom:"1px solid #1a1a1a", fontSize:11 }}>
                      <div>
                        <div style={{ fontFamily:"var(--font-brand)", fontSize:11 }}>#{o.id}</div>
                        <div style={{ color:"#888" }}>{o.shipping?.email}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"var(--font-display)", fontSize:16 }}>{fmt(o.total)}</div>
                        <div style={{ color:"#fbbf24", fontSize:10 }}>{o.status}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div style={{ background:"#111", border:"1px solid #1a1a1a", padding:24 }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:18, marginBottom:20 }}>INVENTORY ALERTS</div>
                {products.filter(p => Object.values(p.stock).reduce((a,b)=>a+b,0) <= 5).map(p => (
                  <div key={p.id} style={{ display:"flex", justifyContent:"space-between", paddingBottom:10, marginBottom:10, borderBottom:"1px solid #1a1a1a", fontSize:11 }}>
                    <span style={{ fontFamily:"var(--font-brand)", fontSize:11 }}>{p.name}</span>
                    <span style={{ color: Object.values(p.stock).reduce((a,b)=>a+b,0)===0?"#e63329":"#fbbf24" }}>
                      {Object.values(p.stock).reduce((a,b)=>a+b,0) === 0 ? "SOLD OUT" : `${Object.values(p.stock).reduce((a,b)=>a+b,0)} LEFT`}
                    </span>
                  </div>
                ))}
                {products.filter(p => Object.values(p.stock).reduce((a,b)=>a+b,0) <= 5).length === 0 &&
                  <div style={{ color:"#4ade80", fontSize:11 }}>✓ All products well stocked</div>}
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:24, marginBottom:24 }}>PRODUCT INVENTORY</div>
            <div style={{ display:"flex", flexDirection:"column", gap:1, background:"#1a1a1a" }}>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 3fr", gap:16, padding:"10px 16px", background:"#151515",
                fontSize:10, color:"#888", letterSpacing:"0.1em", fontFamily:"var(--font-brand)" }}>
                <span>PRODUCT</span><span>PRICE</span><span>TOTAL STOCK</span><span>SIZE BREAKDOWN</span>
              </div>
              {products.map(p => {
                const totalStock = Object.values(p.stock).reduce((a,b)=>a+b,0);
                return (
                  <div key={p.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 3fr", gap:16,
                    padding:"14px 16px", background:"#0d0d0d", alignItems:"center" }}>
                    <div>
                      <div style={{ fontFamily:"var(--font-brand)", fontSize:11, marginBottom:2 }}>{p.name}</div>
                      <div style={{ color:"#888", fontSize:10 }}>{p.category} · {p.color}</div>
                    </div>
                    <div style={{ fontFamily:"var(--font-display)", fontSize:18 }}>{fmt(p.price)}</div>
                    <div style={{ color: totalStock===0?"#e63329":totalStock<=5?"#fbbf24":"#4ade80",
                      fontFamily:"var(--font-display)", fontSize:20 }}>{totalStock}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {Object.entries(p.stock).map(([size, qty]) => (
                        <span key={size} style={{ fontSize:10, padding:"2px 8px",
                          border:`1px solid ${qty===0?"#2a1a1a":qty<=2?"#3a2a0a":"#1a2a1a"}`,
                          color:qty===0?"#e63329":qty<=2?"#fbbf24":"#4ade80" }}>
                          {size}:{qty}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:24, marginBottom:24 }}>ALL ORDERS</div>
            {orders.length === 0 ? (
              <div style={{ color:"#555", fontSize:12, letterSpacing:"0.1em" }}>No orders have been placed yet.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:1, background:"#1a1a1a" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 2fr 1fr 1fr 1fr", gap:16,
                  padding:"10px 16px", background:"#151515", fontSize:10, color:"#888", letterSpacing:"0.1em" }}>
                  {["ORDER ID","CUSTOMER","EMAIL","ITEMS","STATUS","TOTAL"].map(h => <span key={h}>{h}</span>)}
                </div>
                {orders.map(o => (
                  <div key={o.id} style={{ display:"grid", gridTemplateColumns:"1fr 2fr 2fr 1fr 1fr 1fr", gap:16,
                    padding:"14px 16px", background:"#0d0d0d", fontSize:11, alignItems:"center" }}>
                    <span style={{ fontFamily:"var(--font-brand)", fontSize:11 }}>#{o.id}</span>
                    <span>{o.shipping?.name}</span>
                    <span style={{ color:"#888" }}>{o.shipping?.email}</span>
                    <span>{o.items?.reduce((s,i)=>s+i.qty,0)}</span>
                    <span style={{ color:"#fbbf24" }}>{o.status}</span>
                    <span style={{ fontFamily:"var(--font-display)", fontSize:18 }}>{fmt(o.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("shop");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showCart, setShowCart] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const { toasts, add: toast, remove: removeToast } = useToasts();

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = useCallback((product, size) => {
    const stock = product.stock[size];
    const existing = cart.find(i => i.id === product.id && i.size === size);
    const currentQty = existing?.qty || 0;
    if (currentQty >= stock) return toast(`Only ${stock} in stock for ${size}`, "error");

    setCart(prev => {
      const idx = prev.findIndex(i => i.id === product.id && i.size === size);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + 1 };
        return updated;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price,
        image: product.image, size, qty: 1 }];
    });
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 400);
    toast(`${product.name} (${size}) added to cart`, "success");
  }, [cart, toast]);

  const updateCart = (item, qty) => {
    if (qty === 0) return removeFromCart(item);
    const product = products.find(p => p.id === item.id);
    if (product && qty > product.stock[item.size]) return toast("Not enough stock", "error");
    setCart(prev => prev.map(i => i.id === item.id && i.size === item.size ? {...i, qty} : i));
  };

  const removeFromCart = (item) => {
    setCart(prev => prev.filter(i => !(i.id === item.id && i.size === item.size)));
    toast("Item removed", "info");
  };

  const placeOrder = (order) => {
    // Deduct stock
    setProducts(prev => prev.map(p => {
      const orderItems = order.items.filter(i => i.id === p.id);
      if (orderItems.length === 0) return p;
      const newStock = { ...p.stock };
      orderItems.forEach(i => { newStock[i.size] = Math.max(0, (newStock[i.size] || 0) - i.qty); });
      return { ...p, stock: newStock };
    }));
    setOrders(prev => [...prev, order]);
    setCart([]);
  };

  const navStyle = (active) => ({
    background:"none", border:"none", color: active ? "#f0ede6" : "#666", fontFamily:"var(--font-brand)",
    fontSize:11, letterSpacing:"0.1em", cursor:"pointer", transition:"color 0.2s",
    borderBottom: active ? "1px solid var(--red)" : "1px solid transparent", paddingBottom: 2
  });

  return (
    <>
      <FontLink />
      <Toasts toasts={toasts} remove={removeToast} />
      {showAuth && (
        <AuthModal mode={authMode} setMode={setAuthMode}
          onClose={() => setShowAuth(false)}
          onAuth={(u) => setUser(u)} toast={toast} />
      )}
      {showCart && (
        <CartSidebar cart={cart} products={products}
          onClose={() => setShowCart(false)}
          onUpdate={updateCart} onRemove={removeFromCart}
          onCheckout={() => { setShowCart(false); setPage("checkout"); }} />
      )}
      {showAdmin && (
        <AdminDashboard products={products} orders={orders}
          onClose={() => setShowAdmin(false)}
          onUpdateStock={(id, size, qty) => {
            setProducts(prev => prev.map(p => p.id === id ? {...p, stock: {...p.stock, [size]: qty}} : p));
          }} />
      )}

      {/* Nav */}
      <nav style={{ position:"sticky", top:0, zIndex:400, background:"rgba(10,10,10,0.95)",
        backdropFilter:"blur(12px)", borderBottom:"1px solid #1a1a1a",
        padding:"0 48px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => setPage("shop")} style={{ background:"none", border:"none", cursor:"pointer",
          fontFamily:"var(--font-brand)", fontSize:15, letterSpacing:"0.2em", color:"var(--white)" }}>
          VOID<span style={{ color:"var(--red)" }}>.</span>MERCH
        </button>
        <div style={{ display:"flex", gap:32, alignItems:"center" }}>
          <button style={navStyle(page==="shop")} onClick={() => setPage("shop")}>SHOP</button>
          {user && <button style={navStyle(false)} onClick={() => { setPage("shop"); }}>MY ORDERS</button>}
          {user?.email === "admin@void.com" && (
            <button style={navStyle(showAdmin)} onClick={() => setShowAdmin(true)}>ADMIN</button>
          )}
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          {user ? (
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:11, color:"#888" }}>Hi, {user.name}</span>
              <button onClick={() => setUser(null)} style={{ background:"none", border:"none", color:"#555", fontSize:10,
                fontFamily:"var(--font-body)", cursor:"pointer", letterSpacing:"0.05em" }}>SIGN OUT</button>
            </div>
          ) : (
            <button onClick={() => { setAuthMode("login"); setShowAuth(true); }} style={{
              background:"none", border:"1px solid #333", color:"#888", padding:"6px 16px",
              fontFamily:"var(--font-brand)", fontSize:10, letterSpacing:"0.1em", cursor:"pointer", transition:"all 0.2s"
            }}
              onMouseEnter={e => { e.target.style.borderColor = "#666"; e.target.style.color = "#f0ede6"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; }}>
              SIGN IN
            </button>
          )}
          <button onClick={() => setShowCart(true)} style={{
            background:"none", border:"1px solid #333", color:"var(--white)", padding:"6px 16px",
            fontFamily:"var(--font-brand)", fontSize:10, letterSpacing:"0.1em", cursor:"pointer",
            display:"flex", alignItems:"center", gap:8, transition:"border-color 0.2s",
            animation: cartBounce ? "cartBounce 0.4s ease" : "none"
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--red)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#333"}>
            <span>CART</span>
            {cartCount > 0 && (
              <span style={{ background:"var(--red)", borderRadius:"50%", width:18, height:18,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>{cartCount}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Page Router */}
      <main>
        {page === "shop" ? (
          <ShopPage
            products={products} onAddToCart={addToCart}
            user={user} onOpenAuth={() => setShowAuth(true)}
            onOpenCart={() => setShowCart(true)} cartCount={cartCount}
            orders={orders} onOpenAdmin={() => setShowAdmin(true)}
          />
        ) : (
          <CheckoutPage
            cart={cart} products={products} user={user}
            onPlaceOrder={placeOrder}
            onBack={() => setPage("shop")}
            toast={toast}
          />
        )}
      </main>
    </>
  );
}
