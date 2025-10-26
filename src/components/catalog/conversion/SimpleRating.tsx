/**
 * SimpleRating - Exibição Simples de Rating
 * Mostra estrelas e número de avaliações
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface SimpleRatingProps {
  rating: number;
  reviewCount?: number;
  showDistribution?: boolean;
}

const SimpleRating: React.FC<SimpleRatingProps> = ({
  rating,
  reviewCount = 0,
  showDistribution = false,
}) => {
  const ratingDistribution = {
    5: 90,
    4: 7,
    3: 2,
    2: 1,
    1: 0,
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Rating Principal */}
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-600">
              {rating.toFixed(1)}
            </div>
            <div className="flex gap-1 my-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm font-semibold text-yellow-700">
              Excelente
            </div>
            {reviewCount > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                {reviewCount} avaliações
              </div>
            )}
          </div>

          {/* Distribuição (se habilitado) */}
          {showDistribution && (
            <>
              <div className="w-px h-20 bg-gray-300" />
              <div className="flex-1 space-y-2">
                {Object.entries(ratingDistribution).map(([stars, percentage]) => (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <div className="w-16 text-gray-700">{stars} estrelas</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-gray-600 text-right">{percentage}%</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleRating;

