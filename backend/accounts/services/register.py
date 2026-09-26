from accounts.models import User


def register_user(
    email,
    phone_number,
    password,
    full_name,
    delivery_address="",
):
    return User.objects.create_user(
        email=email,
        phone_number=phone_number,
        password=password,
        full_name=full_name,
        delivery_address=delivery_address,
    )