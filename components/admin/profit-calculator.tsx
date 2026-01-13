"use client";

import { useState, useMemo } from "react";
import { Product } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, DollarSign, Package, Truck, TrendingUp, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface ProfitCalculatorProps {
    products: Product[];
}

export function ProfitCalculator({ products }: ProfitCalculatorProps) {
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [sellingPrice, setSellingPrice] = useState<string>("0");
    const [buyingPrice, setBuyingPrice] = useState<string>("0");
    const [packagingCost, setPackagingCost] = useState<string>("2");
    const [deliveryCost, setDeliveryCost] = useState<string>("2");
    const [returnCost, setReturnCost] = useState<string>("5");
    const [otherCosts, setOtherCosts] = useState<string>("0");
    const [wasReturned, setWasReturned] = useState<boolean>(false);

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const productId = e.target.value;
        setSelectedProductId(productId);

        if (productId) {
            const product = products.find((p) => p.id === productId);
            if (product) {
                // Use discounted price if available, otherwise original price
                const price = product.discountedPrice && Number(product.discountedPrice) > 0
                    ? product.discountedPrice
                    : product.originalPrice;
                setSellingPrice(price.toString());
            }
        }
    };

    const MINIMUM_PROFIT = 20; // 20 DT minimum profit per product

    const calculate = () => {
        const sell = parseFloat(sellingPrice) || 0;
        const buy = parseFloat(buyingPrice) || 0;
        const pack = parseFloat(packagingCost) || 0;
        const del = parseFloat(deliveryCost) || 0;
        const ret = parseFloat(returnCost) || 0;
        const other = parseFloat(otherCosts) || 0;

        // If previously returned, we lost Delivery + Return cost on the failed attempt.
        const previousReturnLoss = wasReturned ? (del + ret) : 0;

        // Scenario 1: Successfully Delivered
        // You pay: Buy + Pack + Del + Ret + Other (accounting for risk)
        // You get: Sell
        // Net Profit = Sell - Cost - PreviousLoss
        const costDelivered = buy + pack + del + ret + other;
        // Calculation logic now subtracts previous loss from profit
        const profitDelivered = sell - costDelivered - previousReturnLoss;
        const roiDelivered = costDelivered > 0 ? (profitDelivered / costDelivered) * 100 : 0;
        const grossProfitMargin = sell > 0 ? (profitDelivered / sell) * 100 : 0;

        // Worst case: if returned once, then redelivered
        const costRedelivery = buy + pack + del + ret + del + ret + other;
        const profitRedelivery = sell - costRedelivery;
        const marginRedelivery = sell > 0 ? (profitRedelivery / sell) * 100 : 0;
        const worstCaseMarginOk = marginRedelivery >= 20;

        // Minimum selling price to achieve $20 profit
        const minimumSellingPrice = buy + pack + del + other + MINIMUM_PROFIT;
        const meetsMinimumProfit = profitDelivered >= MINIMUM_PROFIT;

        // Margin status
        let marginStatus: 'bad' | 'minimum' | 'good' = 'bad';
        if (grossProfitMargin >= 30) marginStatus = 'good';
        else if (grossProfitMargin >= 20) marginStatus = 'minimum';
        else marginStatus = 'bad';

        // Scenario 2: Returned (Failed)
        // You pay: Del + Return + Other
        // You get: Item + Packaging back (so Buying Price + Packaging are recovered)
        // Net Loss = -(Del + Ret + Other)
        const lossReturned = -(del + ret + other);

        return { profitDelivered, roiDelivered, lossReturned, costDelivered, minimumSellingPrice, meetsMinimumProfit, grossProfitMargin, marginStatus, marginRedelivery, worstCaseMarginOk };
    };

    const { profitDelivered, roiDelivered, lossReturned, minimumSellingPrice, meetsMinimumProfit, grossProfitMargin, marginStatus, marginRedelivery, worstCaseMarginOk } = useMemo(calculate, [
        sellingPrice,
        buyingPrice,
        packagingCost,
        deliveryCost,
        returnCost,
        otherCosts,
        wasReturned,
    ]);

    const reset = () => {
        setSelectedProductId("");
        setSellingPrice("0");
        setBuyingPrice("0");
        setPackagingCost("0");
        setDeliveryCost("5");
        setReturnCost("2");
        setOtherCosts("0");
        setWasReturned(false);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("fr-TN", {
            style: "currency",
            currency: "TND",
        }).format(val);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-pink-100 shadow-md">
                <CardHeader className="bg-pink-50/30 border-b border-pink-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-100 rounded-full">
                            <Calculator className="w-5 h-5 text-pink-500" />
                        </div>
                        <div>
                            <CardTitle className="text-[#003366] text-xl">Profit & Risk Simulator</CardTitle>
                            <CardDescription>Compare profit if delivered vs. loss if returned</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={reset} className="ml-auto text-gray-400 hover:text-pink-500">
                            <RefreshCcw className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Inputs Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[#003366] font-bold">Select Product (Optional)</Label>
                            <select
                                className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={selectedProductId}
                                onChange={handleProductChange}
                            >
                                <option value="">-- Manual Input --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[#003366] font-bold flex items-center gap-2">
                                    <DollarSign className="w-3 h-3" /> Selling Price
                                </Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    className="font-bold text-[#003366]"
                                />
                                {buyingPrice && (parseFloat(buyingPrice) > 0) && (
                                    <Button
                                        onClick={() => {
                                            const buy = parseFloat(buyingPrice);
                                            const pack = parseFloat(packagingCost) || 0;
                                            const del = parseFloat(deliveryCost) || 0;
                                            const ret = parseFloat(returnCost) || 0;
                                            const other = parseFloat(otherCosts) || 0;
                                            // Worst case cost
                                            const worstCaseCost = buy + pack + del + ret + del + ret + other;
                                            // Minimum selling price for 20% margin
                                            const minSellingPrice = worstCaseCost / 0.80;
                                            setSellingPrice(minSellingPrice.toFixed(3));
                                        }}
                                        size="sm"
                                        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold mt-1"
                                    >
                                        Get Best Price
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[#003366] font-bold flex items-center gap-2">
                                    <DollarSign className="w-3 h-3" /> Buying Price
                                </Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={buyingPrice}
                                    onChange={(e) => setBuyingPrice(e.target.value)}
                                    className="border-blue-100 focus:border-blue-300"
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-semibold flex items-center gap-2">
                                    <Package className="w-3 h-3" /> Emballage
                                </Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={packagingCost}
                                    onChange={(e) => setPackagingCost(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-semibold flex items-center gap-2">
                                    <Truck className="w-3 h-3" /> Livraison
                                </Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={deliveryCost}
                                    onChange={(e) => setDeliveryCost(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-semibold flex items-center gap-2">
                                    <RefreshCcw className="w-3 h-3" /> Coût Retour
                                </Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={returnCost}
                                    onChange={(e) => setReturnCost(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-gray-600 font-semibold">Other Costs</Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    value={otherCosts}
                                    onChange={(e) => setOtherCosts(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="space-y-0.5">
                                <Label className="text-[#003366] font-bold">Was returned before?</Label>
                                <p className="text-xs text-gray-500">Subtracts previous loss (Livraison + Retour) from profit.</p>
                            </div>
                            <Switch
                                checked={wasReturned}
                                onCheckedChange={setWasReturned}
                            />
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gradient-to-br from-pink-50/50 to-white p-6 rounded-3xl border border-pink-100 flex flex-col justify-center space-y-6">
                        <h3 className="text-lg font-black text-[#003366] text-center mb-2 flex items-center justify-center gap-2">
                            <TrendingUp className="w-5 h-5 text-pink-500" /> Results Scenarios
                        </h3>

                        <div className="space-y-4">
                            {/* Scenario 1: Delivered */}
                            <div className={`p-4 rounded-2xl shadow-sm border text-center transition-all ${
                                marginStatus === 'good' ? 'bg-green-50 border-green-100' :
                                marginStatus === 'minimum' ? 'bg-orange-50 border-orange-100' :
                                'bg-red-50 border-red-100'
                            }`}>
                                <p className={`text-xs uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1 ${
                                    marginStatus === 'good' ? 'text-green-700' :
                                    marginStatus === 'minimum' ? 'text-orange-700' :
                                    'text-red-700'
                                }`}>
                                    <Package className="w-3 h-3" /> If Delivered
                                </p>
                                <p className={`text-3xl font-black ${
                                    marginStatus === 'good' ? 'text-green-600' :
                                    marginStatus === 'minimum' ? 'text-orange-500' :
                                    'text-red-500'
                                }`}>
                                    {profitDelivered >= 0 ? '+' : ''}{formatCurrency(profitDelivered)}
                                </p>
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xs font-bold text-gray-500">ROI {roiDelivered.toFixed(0)}%</span>
                                        <div className="h-2 bg-white/60 rounded-full overflow-hidden w-24">
                                            <div
                                                className="h-full bg-purple-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(Math.max(roiDelivered, 0), 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <div>
                                            <span className="text-xs font-bold text-gray-500">Margin {grossProfitMargin.toFixed(1)}%</span>
                                            <span className={`text-xs font-bold ml-1 ${
                                                marginStatus === 'good' ? 'text-green-600' :
                                                marginStatus === 'minimum' ? 'text-yellow-600' :
                                                'text-red-600'
                                            }`}>
                                                {marginStatus === 'good' ? '(Good)' : marginStatus === 'minimum' ? '(Minimum)' : '(Bad)'}
                                            </span>
                                            <p className="text-[10px] text-gray-400 mt-1">Target: 30% (Good) / 20% (Minimum)</p>
                                            {!worstCaseMarginOk && (
                                                <p className="text-[10px] text-red-600 font-bold mt-1">⚠️ Worst case (return + redeliver): {marginRedelivery.toFixed(1)}% margin</p>
                                            )}
                                        </div>
                                        <div className="h-2 bg-white/60 rounded-full overflow-hidden w-24">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    marginStatus === 'good' ? 'bg-green-500' :
                                                    marginStatus === 'minimum' ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min(Math.max(grossProfitMargin, 0), 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scenario 2: Returned */}
                            <div className="p-4 rounded-2xl shadow-sm border bg-red-50 border-red-100 text-center">
                                <p className="text-xs text-red-700 uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                                    <RefreshCcw className="w-3 h-3" /> If Returned
                                </p>
                                <p className="text-2xl font-black text-red-500">
                                    {formatCurrency(lossReturned)}
                                </p>
                                <p className="text-[10px] text-red-400 mt-1 font-medium">
                                    (Loss of Delivery + Return)
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 text-sm text-[#003366] flex gap-3">
                <div className="p-1 bg-purple-100 rounded-full w-fit h-fit shrink-0">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                    <p className="font-bold">Risk vs. Reward:</p>
                    <p className="opacity-80">
                        This breakdown helps you decide if shipping is risky. "If Returned" shows your cash loss assuming the item is returned to inventory.
                    </p>
                </div>
            </div>
        </div>
    );
}
