
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tag, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import { CreateCouponData, Coupon } from '@/hooks/useCoupons';

interface CouponFormProps {
  onSubmit: (data: CreateCouponData) => Promise<void>;
  coupon?: Coupon;
  loading?: boolean;
}

const CouponForm: React.FC<CouponFormProps> = ({ onSubmit, coupon, loading = false }) => {
  const { toast } = useToast();

  const form = useForm<CreateCouponData>({
    defaultValues: {
      code: coupon?.code || '',
      description: coupon?.description || '',
      discount_type: coupon?.discount_type || 'percentage',
      discount_value: coupon?.discount_value || 0,
      min_order_amount: coupon?.min_order_amount || 0,
      max_uses: coupon?.max_uses || undefined,
      expires_at: coupon?.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon?.is_active ?? true
    }
  });

  const handleSubmit = async (data: CreateCouponData) => {
    try {
      // Converter código para maiúsculo
      data.code = data.code.toUpperCase();
      
      // Converter data para ISO se fornecida
      if (data.expires_at) {
        data.expires_at = new Date(data.expires_at).toISOString();
      }

      await onSubmit(data);
      
      if (!coupon) {
        form.reset();
        toast({
          title: "Cupom criado",
          description: "Cupom criado com sucesso!",
        });
      } else {
        toast({
          title: "Cupom atualizado",
          description: "Cupom atualizado com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar cupom. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {coupon ? 'Editar Cupom' : 'Novo Cupom'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Cupom</FormLabel>
                    <FormControl>
                      <Input placeholder="DESCONTO10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Desconto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Porcentagem
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Valor Fixo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valor do Desconto ({form.watch('discount_type') === 'percentage' ? '%' : 'R$'})
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_order_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedido Mínimo (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_uses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de Uso</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Ilimitado"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expires_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Expiração</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do cupom..."
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Cupom Ativo</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="btn-primary w-full" disabled={loading}>
              {coupon ? 'Atualizar Cupom' : 'Criar Cupom'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CouponForm;
