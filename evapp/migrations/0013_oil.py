# Generated by Django 5.1.1 on 2024-10-05 06:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evapp', '0012_car_사진'),
    ]

    operations = [
        migrations.CreateModel(
            name='Oil',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('휘발유', models.DecimalField(blank=True, decimal_places=2, max_digits=7, null=True)),
                ('경유', models.DecimalField(blank=True, decimal_places=2, max_digits=7, null=True)),
            ],
            options={
                'db_table': 'oil',
            },
        ),
    ]
