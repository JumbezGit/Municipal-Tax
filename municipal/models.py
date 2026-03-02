from django.db import models
from django.contrib.auth.models import User


class Taxpayer(models.Model):
    """Model representing a taxpayer in the municipal system."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='taxpayer')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    property_tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.user.email}"
    
    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username


class Payment(models.Model):
    """Model representing a payment made by a taxpayer."""
    
    taxpayer = models.ForeignKey(Taxpayer, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateTimeField(auto_now_add=True)
    transaction_id = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"Payment {self.transaction_id} - {self.taxpayer.user.username}"
