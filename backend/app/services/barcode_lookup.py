"""Búsqueda de productos por código de barras.

1) Busca primero en el catálogo local (catalog_entries: category="barcodes").
2) Si no existe, consulta Open Food Facts (API pública gratuita).
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.catalog import CatalogEntry
from app.schemas.food_log import BarcodeResult


async def lookup_barcode(db: AsyncSession, barcode: str) -> BarcodeResult | None:
    """Busca un código EAN localmente; si no, en Open Food Facts."""
    # 1) Catálogo local
    local = await db.scalar(
        select(CatalogEntry).where(
            CatalogEntry.category == "barcodes", CatalogEntry.key == barcode
        )
    )
    if local and local.data:
        d = local.data
        return BarcodeResult(
            barcode=barcode,
            name=d.get("name", "Producto"),
            brand=d.get("brand"),
            kcal_per_100g=d.get("kcal"),
            protein_per_100g=d.get("protein"),
            carbs_per_100g=d.get("carbs"),
            fat_per_100g=d.get("fat"),
            image_url=d.get("image_url"),
            source="local",
        )

    # 2) Open Food Facts
    return await _openfoodfacts(barcode)


async def _openfoodfacts(barcode: str) -> BarcodeResult | None:
    """Consulta la API pública de Open Food Facts (v2)."""
    import httpx

    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(url)
            if r.status_code != 200:
                return None
            data = r.json().get("product")
            if not data:
                return None
        nutriments = data.get("nutriments") or {}
        return BarcodeResult(
            barcode=barcode,
            name=data.get("product_name") or data.get("generic_name") or "Producto",
            brand=(data.get("brands") or "").split(",")[0].strip() or None,
            kcal_per_100g=nutriments.get("energy-kcal_100g") or nutriments.get("energy_100g"),
            protein_per_100g=nutriments.get("proteins_100g"),
            carbs_per_100g=nutriments.get("carbohydrates_100g"),
            fat_per_100g=nutriments.get("fat_100g"),
            image_url=data.get("image_front_url"),
            source="openfoodfacts",
        )
    except Exception:
        return None