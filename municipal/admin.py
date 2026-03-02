from django.contrib import admin
from .models import Taxpayer, Payment

@admin.register(Taxpayer)
class TaxpayerAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'property_tax_amount', 'is_paid', 'created_at']
    list_filter = ['is_paid', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['taxpayer', 'amount', 'payment_date', 'transaction_id']
    list_filter = ['payment_date']
    search_fields = ['taxpayer__user__username', 'transaction_id']
    readonly_fields = ['payment_date', 'transaction_id']
