"use client";

import Image from "next/image";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ProductImage {
    id: string;
    url: string;
}

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    originalPrice: number | string;
    discountedPrice?: number | string | null;
    stock: number;
    categoryId: string;
    category: Category;
    images: ProductImage[];
    isFeatured: boolean;
    isArchived: boolean;
}

interface ProductListProps {
    products: Product[];
    onEdit: (product: Product) => void;
}

export function ProductList({ products, onEdit }: ProductListProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const onDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const result = await deleteProduct(id);
            if (result.success) {
                toast.success("Accessory deleted successfully! ✨");
                router.refresh();
            } else {
                toast.error(result.error || "Error deleting product");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Something went wrong");
        } finally {
            setIsDeleting(null);
        }
    };

    if (products.length === 0) {
        return (
            <Card className="border-dashed border-pink-200 bg-pink-50/10 rounded-3xl">
                <CardContent className="py-20 flex flex-col items-center justify-center">
                    <p className="text-gray-400 italic">No accessories listed yet. Start by adding one above! ✨</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-pink-100 shadow-xl shadow-pink-100/10 rounded-3xl overflow-hidden">
            <CardHeader className="bg-pink-50/30 border-b border-pink-100/50 py-4">
                <CardTitle className="text-lg font-bold text-[#003366]">Recent Inventory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-pink-50">
                            <TableHead className="px-6 font-bold text-[#003366]">Product</TableHead>
                            <TableHead className="px-6 font-bold text-[#003366]">Category</TableHead>
                            <TableHead className="px-6 font-bold text-[#003366]">Price</TableHead>
                            <TableHead className="px-6 font-bold text-[#003366]">Stock</TableHead>
                            <TableHead className="px-6 font-bold text-[#003366]">Status</TableHead>
                            <TableHead className="px-6 font-bold text-[#003366] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="hover:bg-pink-50/20 border-pink-50 transition-colors">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-pink-100 shadow-sm transition-transform hover:scale-105">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-pink-100" />
                                            )}
                                        </div>
                                        <span className="font-bold text-[#003366]">{product.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge variant="secondary" className="bg-pink-100/50 text-pink-600 border-none hover:bg-pink-100 font-semibold">
                                        {product.category.name}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {product.discountedPrice && Number(product.discountedPrice) < Number(product.originalPrice) && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 line-through">
                                                    {Number(product.originalPrice).toFixed(3)} DT
                                                </span>
                                                <Badge className="bg-red-500 hover:bg-red-600 text-[10px] px-1.5 py-0">
                                                    -{Math.round(((Number(product.originalPrice) - Number(product.discountedPrice)) / Number(product.originalPrice)) * 100)}%
                                                </Badge>
                                            </div>
                                        )}
                                        <span className="font-bold text-gray-700">
                                            {Number(product.discountedPrice || product.originalPrice).toFixed(3)} <span className="text-[10px] text-gray-400">DT</span>
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <span className={`text-sm font-semibold ${product.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>
                                        {product.stock}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {product.isArchived ? (
                                            <Badge variant="outline" className="text-gray-400 border-gray-200">Hidden</Badge>
                                        ) : (
                                            <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
                                        )}
                                        {product.isFeatured && (
                                            <Badge className="bg-[#FF8BBA] hover:bg-[#FF75AA]">Featured</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            onClick={() => onEdit(product)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-[#003366] hover:bg-pink-50 rounded-full"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    disabled={isDeleting === product.id}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                >
                                                    {isDeleting === product.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-3xl border-pink-100">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-[#003366] font-bold text-xl">Are you absolutely sure? ✨</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-500">
                                                        This will permanently remove <span className="font-bold text-pink-500">{product.name}</span> from your beautiful inventory. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-full border-pink-100 text-gray-500 hover:bg-pink-50 transition-all">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onDelete(product.id)}
                                                        className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                                                    >
                                                        Yes, delete it
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
