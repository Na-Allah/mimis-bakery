
import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models
from django.db.models.functions import Lower


phone_number_validator = RegexValidator(
    regex=r"^\+[1-9]\d{7,14}$",
    message="Enter a phone number in E.164 format, for example +2348012345678.",
)


class UserManager(BaseUserManager):
    """Creates users whose email and phone number are both identities."""

    def create_user(self, email, phone_number, password=None, **extra_fields):
        if not email:
            raise ValueError("An email address is required.")
        if not phone_number:
            raise ValueError("A phone number is required.")

        user = self.model(
            email=self.normalize_email(email).strip().lower(),
            phone_number=User.normalize_phone_number(phone_number),
            **extra_fields,
        )
        user.set_password(password)
        user.full_clean()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, phone_number, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
       
        ADMIN = "ADMIN", "Admin"
        CUSTOMER = "CUSTOMER", "Customer"


    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=50)
    delivery_address = models.TextField(default = "", blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=16, unique=True, validators=[phone_number_validator])
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.CUSTOMER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["phone_number","full_name"]

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("email"), name="users_user_email_ci_unique"),
        ]

    @staticmethod
    def normalize_phone_number(phone_number):
        return "".join(str(phone_number).strip().split()).replace("-", "")

    @property
    def is_customer (self):
        return self.role == self.Role.CUSTOMER

    @property
    def is_admin (self):
        return self.role == self.Role.ADMIN

    
    def save(self, *args, **kwargs):
        self.email = BaseUserManager.normalize_email(self.email).strip().lower()
        self.phone_number = self.normalize_phone_number(self.phone_number)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
