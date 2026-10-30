import { Layout } from "../layout.js";

// A category page of an online shop, built from small design-system components
// that spread their remaining props onto the element.

export const PRODUCT_COUNT = 48;

const products = Array.from({ length: PRODUCT_COUNT }, (_, i) => ({
  id: 1000 + i,
  name: `Product ${i} "Deluxe" & more`,
  slug: `product-${i}`,
  price: `€${(19.99 + i).toFixed(2)}`,
  oldPrice: `€${(29.99 + i).toFixed(2)}`,
  sale: i % 4 === 0,
  soldOut: i % 7 === 0,
  rating: i % 6,
}));

function Icon({ name, size = 16, class: className = undefined, ...rest }) {
  return (
    <svg
      class={["icon", `icon-${name}`, className]}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...rest}
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}

function Button({ variant = "primary", size = "md", icon = undefined, children, ...rest }) {
  return (
    <button type="button" class={["btn", `btn-${variant}`, `btn-${size}`]} {...rest}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </button>
  );
}

function Badge({ tone = "neutral", children }) {
  return <span class={["badge", `badge-${tone}`]}>{children}</span>;
}

function Rating({ value }) {
  return (
    <div class="rating" role="img" aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon name="star" class={{ filled: star <= value }} />
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  const url = `/products/${product.slug}`;
  const image = `/images/${product.slug}`;
  return (
    <article
      class={["card", { "card-sale": product.sale, "card-sold-out": product.soldOut }]}
      data-product-id={product.id}
    >
      <a href={url} class="card-image">
        <img
          src={`${image}-400.jpg`}
          srcset={`${image}-400.jpg 400w, ${image}-800.jpg 800w`}
          sizes="(min-width: 768px) 25vw, 50vw"
          alt={product.name}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
        />
      </a>
      <div class="card-body">
        <h2 class="card-title">
          <a href={url}>{product.name}</a>
        </h2>
        {product.sale && <Badge tone="danger">Sale</Badge>}
        {product.soldOut && <Badge>Sold out</Badge>}
        <p class="price">
          {product.sale ? (
            <>
              <del>{product.oldPrice}</del> <ins>{product.price}</ins>
            </>
          ) : (
            product.price
          )}
        </p>
        <Rating value={product.rating} />
        <Button
          icon="cart"
          disabled={product.soldOut}
          aria-label={`Add ${product.name} to cart`}
          data-action="add-to-cart"
          data-product-id={product.id}
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}

function Pagination({ page, pages }) {
  return (
    <nav class="pagination" aria-label="Pagination">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <a
          href={`?page=${n}`}
          class={{ current: n === page }}
          aria-current={n === page ? "page" : undefined}
        >
          {n}
        </a>
      ))}
    </nav>
  );
}

export function ProductGrid() {
  return (
    <Layout title="Products">
      <h1>All products</h1>
      <div class="grid" style={{ "--columns": "4", gap: "1rem" }}>
        {products.map((product) => (
          <ProductCard product={product} />
        ))}
      </div>
      <Pagination page={1} pages={10} />
    </Layout>
  );
}
