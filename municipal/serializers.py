from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Taxpayer, Payment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class TaxpayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Taxpayer
        fields = ['id', 'user', 'full_name', 'phone', 'address', 
                  'property_tax_amount', 'is_paid', 'created_at', 'updated_at']


class TaxpayerRegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)
    address = serializers.CharField(required=False)
    property_tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    
    class Meta:
        model = Taxpayer
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                  'phone', 'address', 'property_tax_amount']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        
        taxpayer = Taxpayer.objects.create(
            user=user,
            phone=validated_data.get('phone', ''),
            address=validated_data.get('address', ''),
            property_tax_amount=validated_data.get('property_tax_amount', 0),
        )
        
        return taxpayer


class PaymentSerializer(serializers.ModelSerializer):
    taxpayer_name = serializers.CharField(source='taxpayer.full_name', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'taxpayer', 'taxpayer_name', 'amount', 'payment_date', 
                  'transaction_id', 'description']


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['amount', 'description']
