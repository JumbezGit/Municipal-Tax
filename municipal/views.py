from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db.models import Sum, Count
import uuid
from datetime import datetime

from .models import Taxpayer, Payment
from .serializers import (
    TaxpayerSerializer, 
    TaxpayerRegistrationSerializer, 
    PaymentSerializer,
    PaymentCreateSerializer,
    UserSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_taxpayer(request):
    """Register a new taxpayer."""
    serializer = TaxpayerRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        taxpayer = serializer.save()
        refresh = RefreshToken.for_user(taxpayer.user)
        
        return Response({
            'message': 'Taxpayer registered successfully',
            'user': UserSerializer(taxpayer.user).data,
            'taxpayer': TaxpayerSerializer(taxpayer).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_taxpayer(request):
    """Login a taxpayer or admin user."""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Please provide both username and password'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.check_password(password):
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check if user is admin (is_staff or is_superuser)
    if user.is_staff or user.is_superuser:
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'taxpayer': None,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    
    # Check if user is a taxpayer
    if not hasattr(user, 'taxpayer'):
        return Response(
            {'error': 'User is not a taxpayer'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    refresh = RefreshToken.for_user(user)
    taxpayer = user.taxpayer
    
    return Response({
        'message': 'Login successful',
        'user': UserSerializer(user).data,
        'taxpayer': TaxpayerSerializer(taxpayer).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def payments(request):
    """Get or create payments for the authenticated taxpayer."""
    # Admin users can't make payments through this endpoint
    if request.user.is_staff or request.user.is_superuser:
        return Response(
            {'error': 'Admin users cannot make payments through this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if user has taxpayer profile
    if not hasattr(request.user, 'taxpayer'):
        return Response(
            {'error': 'User is not a taxpayer'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    taxpayer = request.user.taxpayer
    
    if request.method == 'GET':
        payments = Payment.objects.filter(taxpayer=taxpayer).order_by('-payment_date')
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Make a payment
        amount = request.data.get('amount')
        
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        amount = float(amount)
        
        if amount < float(taxpayer.property_tax_amount):
            return Response(
                {'error': f'Amount must be at least {taxpayer.property_tax_amount}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate unique transaction ID
        transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}-{datetime.now().strftime('%Y%m%d')}"
        
        payment = Payment.objects.create(
            taxpayer=taxpayer,
            amount=amount,
            transaction_id=transaction_id,
            description=request.data.get('description', '')
        )
        
        # Mark taxpayer as paid
        taxpayer.is_paid = True
        taxpayer.save()
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def taxpayer_profile(request):
    """Get the authenticated taxpayer's profile."""
    # Admin users don't have taxpayer profile
    if request.user.is_staff or request.user.is_superuser:
        return Response(
            {'error': 'Admin users do not have a taxpayer profile'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user has taxpayer profile
    if not hasattr(request.user, 'taxpayer'):
        return Response(
            {'error': 'User is not a taxpayer'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    taxpayer = request.user.taxpayer
    serializer = TaxpayerSerializer(taxpayer)
    return Response(serializer.data)


# Admin Views

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_all_taxpayers(request):
    """Get all taxpayers (admin only)."""
    taxpayers = Taxpayer.objects.all().select_related('user')
    serializer = TaxpayerSerializer(taxpayers, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_all_payments(request):
    """Get all payments (admin only)."""
    payments = Payment.objects.all().select_related('taxpayer__user').order_by('-payment_date')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_unpaid_taxpayers(request):
    """Get all unpaid taxpayers (admin only)."""
    taxpayers = Taxpayer.objects.filter(is_paid=False).select_related('user')
    serializer = TaxpayerSerializer(taxpayers, many=True)
    
    # Calculate total unpaid amount
    total_unpaid = taxpayers.aggregate(
        total=Sum('property_tax_amount')
    )['total'] or 0
    
    return Response({
        'taxpayers': serializer.data,
        'total_unpaid': total_unpaid,
        'count': taxpayers.count()
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    """Get admin dashboard statistics."""
    total_taxpayers = Taxpayer.objects.count()
    paid_taxpayers = Taxpayer.objects.filter(is_paid=True).count()
    unpaid_taxpayers = Taxpayer.objects.filter(is_paid=False).count()
    
    total_collected = Payment.objects.aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    recent_payments = Payment.objects.select_related('taxpayer__user').order_by('-payment_date')[:10]
    
    return Response({
        'total_taxpayers': total_taxpayers,
        'paid_taxpayers': paid_taxpayers,
        'unpaid_taxpayers': unpaid_taxpayers,
        'total_collected': total_collected,
        'recent_payments': PaymentSerializer(recent_payments, many=True).data
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_create_taxpayer(request):
    """Create a taxpayer (admin only)."""
    serializer = TaxpayerRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        taxpayer = serializer.save()
        return Response({
            'message': 'Taxpayer created successfully',
            'taxpayer': TaxpayerSerializer(taxpayer).data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def admin_taxpayer_detail(request, pk):
    """Update or delete a taxpayer (admin only)."""
    try:
        taxpayer = Taxpayer.objects.get(pk=pk)
    except Taxpayer.DoesNotExist:
        return Response(
            {'error': 'Taxpayer not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'PUT':
        serializer = TaxpayerSerializer(taxpayer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        taxpayer.user.delete()
        return Response(
            {'message': 'Taxpayer deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )
