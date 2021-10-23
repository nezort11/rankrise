# Generated by Django 3.2.8 on 2021-10-23 08:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('product', '0003_alter_product_name'),
        ('question', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Option',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='product.product', verbose_name='product')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='question.question', verbose_name='question')),
            ],
            options={
                'verbose_name': 'option',
                'verbose_name_plural': 'options',
                'unique_together': {('question', 'product')},
            },
        ),
    ]
