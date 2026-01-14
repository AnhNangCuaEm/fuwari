import { NextResponse } from 'next/server';
import { getFavoriteProducts } from '@/lib/products';

export async function GET() {
  try {
    const products = await getFavoriteProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching favorite products:', error);
    return NextResponse.json({ error: 'Failed to fetch favorite products' }, { status: 500 });
  }
}
    