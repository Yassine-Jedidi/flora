"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Product } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  DollarSign,
  Package,
  Truck,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

interface ProfitCalculatorProps {
  products: Product[];
}

export function ProfitCalculator({ products }: ProfitCalculatorProps) {
  const t = useTranslations("Admin.profit");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<string>("0");
  const [buyingPrice, setBuyingPrice] = useState<string>("0");
  const [packagingCost, setPackagingCost] = useState<string>("2");
  const [deliveryCost, setDeliveryCost] = useState<string>("2");
  const [returnCost, setReturnCost] = useState<string>("5");
  const [otherCosts, setOtherCosts] = useState<string>("0");
  const [isFreeShipping, setIsFreeShipping] = useState<boolean>(false);
  const [wasReturned, setWasReturned] = useState<boolean>(false);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    setSelectedProductId(productId);

    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        // Use discounted price if available, otherwise original price
        const price =
          product.discountedPrice && Number(product.discountedPrice) > 0
            ? product.discountedPrice
            : product.originalPrice;
        setSellingPrice(price.toString());
      }
    }
  };

  const MINIMUM_PROFIT = 20; // 20 DT minimum profit per product

  const calculate = useCallback(() => {
    const sell = parseFloat(sellingPrice) || 0;
    const buy = parseFloat(buyingPrice) || 0;
    const pack = parseFloat(packagingCost) || 0;
    const del = parseFloat(deliveryCost) || 0;
    const ret = parseFloat(returnCost) || 0;
    const other = parseFloat(otherCosts) || 0;

    // If previously returned, we lost Delivery + Return cost on the failed attempt.
    const previousReturnLoss = wasReturned ? del + ret : 0;

    // Scenario 1: Successfully Delivered
    const costDelivered = buy + pack + del + ret + other;
    const profitDelivered = sell - costDelivered - previousReturnLoss;
    const roiDelivered =
      costDelivered > 0 ? (profitDelivered / costDelivered) * 100 : 0;
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
    let marginStatus: "bad" | "minimum" | "good" = "bad";
    if (grossProfitMargin >= 30) marginStatus = "good";
    else if (grossProfitMargin >= 20) marginStatus = "minimum";
    else marginStatus = "bad";

    // ROI status
    let roiStatus: "bad" | "minimum" | "good" | "excellent" = "bad";
    if (roiDelivered >= 150) roiStatus = "excellent";
    else if (roiDelivered >= 100) roiStatus = "good";
    else if (roiDelivered >= 50) roiStatus = "minimum";
    else roiStatus = "bad";

    // Scenario 2: Returned (Failed)
    const lossReturned = -(del + ret + other);

    return {
      profitDelivered,
      roiDelivered,
      lossReturned,
      costDelivered,
      minimumSellingPrice,
      meetsMinimumProfit,
      grossProfitMargin,
      marginStatus,
      marginRedelivery,
      worstCaseMarginOk,
      roiStatus,
    };
  }, [
    sellingPrice,
    buyingPrice,
    packagingCost,
    deliveryCost,
    returnCost,
    otherCosts,
    wasReturned,
  ]);

  const {
    profitDelivered,
    roiDelivered,
    lossReturned,
    grossProfitMargin,
    marginStatus,
    marginRedelivery,
    worstCaseMarginOk,
    roiStatus,
  } = useMemo(() => calculate(), [calculate]);

  const reset = () => {
    setSelectedProductId("");
    setSellingPrice("0");
    setBuyingPrice("0");
    setPackagingCost("0");
    setDeliveryCost("5");
    setReturnCost("2");
    setOtherCosts("0");
    setIsFreeShipping(false);
    setWasReturned(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
    }).format(val);
  };

  // Auto-refresh selling price when free shipping is toggled
  useEffect(() => {
    if (buyingPrice && parseFloat(buyingPrice) > 0) {
      const buy = parseFloat(buyingPrice);
      const pack = parseFloat(packagingCost) || 0;
      const del = parseFloat(deliveryCost) || 0;
      const ret = parseFloat(returnCost) || 0;
      const other = parseFloat(otherCosts) || 0;
      const surcharge = isFreeShipping ? 7 : 0;

      // Cost for successful delivery (includes return risk)
      const costDelivered = buy + pack + del + ret + other;
      // Worst case cost (return + redeliver)
      const worstCaseCost = buy + pack + del + ret + del + ret + other;

      // Price for 20% worst-case margin
      const priceForMargin = worstCaseCost / 0.8;

      // Price for 50% ROI minimum
      const priceForROI = costDelivered * 1.5;

      // Use the HIGHER of the two to meet both requirements, then add customer surcharge
      const bestPrice = Math.max(priceForMargin, priceForROI) + surcharge;

      setTimeout(() => setSellingPrice(bestPrice.toFixed(3)), 0);
    }
  }, [isFreeShipping, buyingPrice, packagingCost, deliveryCost, returnCost, otherCosts]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-pink-100 shadow-md">
        <CardHeader className="bg-pink-50/30 border-b border-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-full">
              <Calculator className="w-5 h-5 text-pink-500" />
            </div>
            <div>
              <CardTitle className="text-flora-dark text-xl">
                {t("title")}
              </CardTitle>
              <CardDescription>
                {t("subtitle")}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              className="ml-auto text-gray-400 hover:text-pink-500"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {/* Inputs Section */}
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label className="text-flora-dark font-bold">
                {t("labels.selectProduct")}
              </Label>
              <select
                className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedProductId}
                onChange={handleProductChange}
              >
                <option value="">{t("labels.manualInput")}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-flora-dark font-bold flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> {t("labels.sellingPrice")}
                </Label>
                <Input
                  type="number"
                  step="0.001"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="font-bold text-flora-dark"
                />
                {buyingPrice && parseFloat(buyingPrice) > 0 && (
                  <Button
                    onClick={() => {
                      const buy = parseFloat(buyingPrice);
                      const pack = parseFloat(packagingCost) || 0;
                      const del = parseFloat(deliveryCost) || 0;
                      const ret = parseFloat(returnCost) || 0;
                      const other = parseFloat(otherCosts) || 0;
                      const surcharge = isFreeShipping ? 7 : 0;

                      // Cost for successful delivery (includes return risk)
                      const costDelivered = buy + pack + del + ret + other;
                      // Worst case cost (return + redeliver)
                      const worstCaseCost =
                        buy + pack + del + ret + del + ret + other;

                      // Price for 20% worst-case margin
                      const priceForMargin = worstCaseCost / 0.8;

                      // Price for 50% ROI minimum
                      const priceForROI = costDelivered * 1.5;

                      // Use the HIGHER of the two to meet both requirements, then add customer surcharge
                      const bestPrice =
                        Math.max(priceForMargin, priceForROI) + surcharge;

                      setSellingPrice(bestPrice.toFixed(3));
                    }}
                    size="sm"
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold mt-1"
                  >
                    {t("buttons.bestPrice")}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-flora-dark font-bold flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> {t("labels.buyingPrice")}
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
                  <Package className="w-3 h-3" /> {t("labels.packaging")}
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
                  <Truck className="w-3 h-3" /> {t("labels.delivery")}
                </Label>
                <Input
                  type="number"
                  step="0.001"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="space-y-0.5">
                <Label className="text-flora-dark font-bold">
                  {t("labels.freeShipping")}
                </Label>
                <p className="text-xs text-gray-500">
                  {t("help.freeShipping")}
                </p>
              </div>
              <Switch
                checked={isFreeShipping}
                onCheckedChange={setIsFreeShipping}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-600 font-semibold flex items-center gap-2">
                  <RefreshCcw className="w-3 h-3" /> {t("labels.return")}
                </Label>
                <Input
                  type="number"
                  step="0.001"
                  value={returnCost}
                  onChange={(e) => setReturnCost(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-600 font-semibold">
                  {t("labels.other")}
                </Label>
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
                <Label className="text-flora-dark font-bold">
                  {t("labels.wasReturned")}
                </Label>
                <p className="text-xs text-gray-500">
                  {t("help.wasReturned")}
                </p>
              </div>
              <Switch checked={wasReturned} onCheckedChange={setWasReturned} />
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-gradient-to-br from-pink-50/50 to-white p-4 md:p-6 rounded-3xl border border-pink-100 flex flex-col justify-center space-y-4 md:space-y-6">
            <h3 className="text-lg font-black text-flora-dark text-center mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-500" /> {t("results.title")}
            </h3>

            <div className="space-y-4">
              {/* Scenario 1: Delivered */}
              <div
                className={`p-4 rounded-2xl shadow-sm border text-center transition-all ${marginStatus === "good"
                  ? "bg-green-50 border-green-100"
                  : marginStatus === "minimum"
                    ? "bg-orange-50 border-orange-100"
                    : "bg-red-50 border-red-100"
                  }`}
              >
                <p
                  className={`text-xs uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1 ${marginStatus === "good"
                    ? "text-green-700"
                    : marginStatus === "minimum"
                      ? "text-orange-700"
                      : "text-red-700"
                    }`}
                >
                  <Package className="w-3 h-3" /> {t("results.delivered")}
                </p>
                <p
                  className={`text-3xl font-black ${marginStatus === "good"
                    ? "text-green-600"
                    : marginStatus === "minimum"
                      ? "text-orange-500"
                      : "text-red-500"
                    }`}
                >
                  {profitDelivered >= 0 ? "+" : ""}
                  {formatCurrency(profitDelivered)}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-gray-500">
                        ROI {roiDelivered.toFixed(0)}%
                      </span>
                      <span
                        className={`text-xs font-bold ml-1 ${roiStatus === "excellent"
                          ? "text-blue-600"
                          : roiStatus === "good"
                            ? "text-green-600"
                            : roiStatus === "minimum"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                      >
                        {roiStatus === "excellent"
                          ? t("results.status.excellent")
                          : roiStatus === "good"
                            ? t("results.status.good")
                            : roiStatus === "minimum"
                              ? t("results.status.minimum")
                              : t("results.status.bad")}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {t("results.target")}: 100% ({t("results.status.good")}) / 50% ({t("results.status.minimum")})
                      </p>
                    </div>
                    <div className="h-2 bg-white/60 rounded-full overflow-hidden w-24">
                      <div
                        className={`h-full rounded-full transition-all ${roiStatus === "excellent"
                          ? "bg-blue-500"
                          : roiStatus === "good"
                            ? "bg-green-500"
                            : roiStatus === "minimum"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        style={{
                          width: `${Math.min(Math.max(roiDelivered, 0), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-gray-500">
                        Margin {grossProfitMargin.toFixed(1)}%
                      </span>
                      <span
                        className={`text-xs font-bold ml-1 ${marginStatus === "good"
                          ? "text-green-600"
                          : marginStatus === "minimum"
                            ? "text-yellow-600"
                            : "text-red-600"
                          }`}
                      >
                        {marginStatus === "good"
                          ? t("results.status.good")
                          : marginStatus === "minimum"
                            ? t("results.status.minimum")
                            : t("results.status.bad")}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {t("results.target")}: 30% ({t("results.status.good")}) / 20% ({t("results.status.minimum")})
                      </p>
                      {!worstCaseMarginOk && (
                        <p className="text-[10px] text-red-600 font-bold mt-1">
                          ⚠️ {t("results.worstCase")}:{" "}
                          {marginRedelivery.toFixed(1)}% {t("results.margin").toLowerCase()}
                        </p>
                      )}
                    </div>
                    <div className="h-2 bg-white/60 rounded-full overflow-hidden w-24">
                      <div
                        className={`h-full rounded-full transition-all ${marginStatus === "good"
                          ? "bg-green-500"
                          : marginStatus === "minimum"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                          }`}
                        style={{
                          width: `${Math.min(
                            Math.max(grossProfitMargin, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario 2: Returned */}
              <div className="p-4 rounded-2xl shadow-sm border bg-red-50 border-red-100 text-center">
                <p className="text-xs text-red-700 uppercase font-bold tracking-wider mb-1 flex items-center justify-center gap-1">
                  <RefreshCcw className="w-3 h-3" /> {t("results.returned")}
                </p>
                <p className="text-2xl font-black text-red-500">
                  {formatCurrency(lossReturned)}
                </p>
                <p className="text-[10px] text-red-400 mt-1 font-medium">
                  {t("results.returnLoss")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 text-sm text-flora-dark flex gap-3">
        <div className="p-1 bg-purple-100 rounded-full w-fit h-fit shrink-0">
          <DollarSign className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="font-bold">{t("tip.title")}</p>
          <p className="opacity-80">
            {t("tip.text")}
          </p>
        </div>
      </div>
    </div>
  );
}
