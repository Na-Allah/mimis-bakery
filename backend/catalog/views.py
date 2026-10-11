from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from django.shortcuts import get_object_or_404
from django.db import transaction

from accounts.permissions import IsAdminUser
from .models import Category, Product, Section
from .serializers import CategorySerializer, ProductSerializer, SectionSerializer


class MenuView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_admin:
            sections = Section.objects.all()
            categories = Category.objects.all()
            products = Product.objects.all()
        else:
            sections = Section.objects.filter(is_active=True)
            categories = Category.objects.filter(is_active=True, section__is_active=True)
            products = Product.objects.filter(
                category__is_active=True, category__section__is_active=True
            )
        ctx = {"request": request}  # lets ImageField return absolute URLs
        return Response({
            "sections": SectionSerializer(sections, many=True, context=ctx).data,
            "categories": CategorySerializer(categories, many=True, context=ctx).data,
            "products": ProductSerializer(products, many=True, context=ctx).data,
        })


class ProductManageView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ProductSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(
            self.get_serializer(product).data,
            status=201,
        )

    def patch(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(self.get_serializer(product).data)

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        product.delete()
        return Response(status=204)


class SectionManageView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = SectionSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        section = serializer.save()
        return Response(self.get_serializer(section).data, status=201)

    def patch(self, request, pk):
        section = get_object_or_404(Section, pk=pk)
        serializer = self.get_serializer(section, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        section = serializer.save()
        return Response(self.get_serializer(section).data)

    @transaction.atomic
    def delete(self, request, pk):
        section = get_object_or_404(Section, pk=pk)
        Product.objects.filter(category__section=section).delete()
        Category.objects.filter(section=section).delete()
        section.delete()
        return Response(status=204)


class CategoryManageView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CategorySerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return Response(self.get_serializer(category).data, status=201)

    def patch(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        serializer = self.get_serializer(category, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return Response(self.get_serializer(category).data)

    @transaction.atomic
    def delete(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        Product.objects.filter(category=category).delete()
        category.delete()
        return Response(status=204)