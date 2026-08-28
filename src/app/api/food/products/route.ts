import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

export async function GET() {
  try {
    const ref = collection(
      firestore,
      FIRESTORE_COLLECTIONS.PRODUCTS,
    );

    const snap = await getDocs(ref);

    const products = snap.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const variants = Array.isArray(data.variants)
        ? data.variants
        : [];

      return {
        id: doc.id,
        productId: String(data.productId || doc.id),
        slug: String(data.slug || ""),
        name: String(data.name || ""),
        categoryId: String(data.categoryId || ""),
        category: String(
          data.categoryName || data.category || "General",
        ),
        description: String(data.description || ""),
        imageUrl: String(
          data.imageUrl ||
            data.image ||
            "/images/default-product-placeholder.png",
        ),
        status:
          data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
        featured: Boolean(data.featured),
        variantsCount: variants.length,
        variants,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      };
    });

    // Newest first when timestamps exist
    products.sort((a, b) => {
      const aTime = String(a.updatedAt || a.createdAt || "");
      const bTime = String(b.updatedAt || b.createdAt || "");
      return bTime.localeCompare(aTime);
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET /api/food/products", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PRODUCTS_FETCH_FAILED",
          message: "Failed to load products from Firestore.",
        },
      },
      { status: 500 },
    );
  }
}