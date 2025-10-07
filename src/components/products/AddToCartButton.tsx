'use client';

import { useCart } from '@/lib/hooks/useCart';
import { useTranslations } from 'next-intl';

interface AddToCartButtonProps {
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        image: string;
        quantity: number;
    };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const t = useTranslations();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image
        });
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={product.quantity === 0}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                product.quantity > 0
                    ? 'bg-almond-6/80 hover:bg-almond-5/80 text-white'
                    : 'bg-gray-400 text-gray-700 cursor-not-allowed!'
            }`}
        >
            {product.quantity > 0 ? t("shopping.cart.addToCart") : t("shopping.stock.outOfStock")}
        </button>
    );
}
