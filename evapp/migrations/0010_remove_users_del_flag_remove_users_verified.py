# Generated by Django 5.1.1 on 2024-10-01 05:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('evapp', '0009_remove_users_userpw'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='users',
            name='del_flag',
        ),
        migrations.RemoveField(
            model_name='users',
            name='verified',
        ),
    ]
