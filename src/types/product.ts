export interface Product {
    id: number;
    name: string;
    engName: string;
    description: string;
    engDescription: string;
    ingredients: string[];
    engIngredients: string[];
    allergens: string[];
    engAllergens: string[];
    category: string;
    price: number;
    quantity: number;
    image: string;
    modelPath?: string;
    created_at: string;
    updated_at: string;
}
