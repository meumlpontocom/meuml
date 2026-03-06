
from marshmallow.fields import List, String, Integer, DateTime, Boolean, Nested
from marshmallow.schema import Schema
from marshmallow.validate import Length
from marshmallow import validates_schema, ValidationError


class ArticleVariationParentSchema(Schema):
    class Meta:
        pass

    parent_id = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'id' do produto pai é obrigatório"
        }
    )


class ArticleAttributeSchema(Schema):
    class Meta:
        pass
    
    id = Integer(
        required=False,
        allow_none=True,
        dump_default=None,
        load_default=None,
    )

    field = String(
        required=True,
        validate=Length(min=1),
        error_messages={
            'required' : "O campo 'nome' de atributo é obrigatório"
        }
    )

    value = String(
        required=True,
        error_messages={
            'required' : "O campo 'valor' de atributo é obrigatório"
        }
    )


class ArticleImageSchema(Schema):
    class Meta:
        pass
    
    id = Integer(
        required=True,
    )

    is_main_image = Boolean(
        required=True,
    )


class ArticleSchema(Schema):
    class Meta:
        pass

    name = String(
        validate=Length(min=1),
        required=True,
        error_messages={
            'required' : "O campo 'nome' é obrigatório"
        }
    )

    sku = String(
        validate=Length(min=1),
        required=False,
        allow_none=True,
        dump_default=None,
        load_default=None,
    )

    description = String(
        validate=Length(min=1),
        required=False,
        allow_none=True,
        dump_default=None,
        load_default=None,
    )

    has_expiration_date = Boolean(
        required=True,
        error_messages={
            'required' : "O campo 'possui validade' é obrigatório"
        }
    )

    attributes = List(
        Nested(ArticleAttributeSchema)
    )

    images = List(
        Nested(ArticleImageSchema),
        #validate=Length(
        #    min=1,
        #    error='Ao menos uma imagem deve ser submetida'
        #),
        many=True,
        required=False
    )

    @validates_schema
    def validate_numbers(self, data, **kwargs):
        main_images_count = 0
        for image in data['images']:
            if image['is_main_image']:
                main_images_count+=1
        #if main_images_count == 0:
        #    raise ValidationError("O produto deve possuir uma imagem principal")
        if main_images_count > 1:
            raise ValidationError("Apenas uma das imagens deve ser selecionada como imagem principal")


class NewArticleSchema(Schema):
    class Meta:
        pass
    
    new_article = List(
        Nested(ArticleSchema),
        validate=Length(
            min=1,
            error='Nenhum produto válido foi submetido'
        ),
        many=True,
        required=True
    )

    article_variation_parent = Nested(
        ArticleVariationParentSchema,
        required=False,
        allow_none=True,
        dump_default=None,
        load_default=None,
    )

    # @validates_schema
    # def validate_numbers(self, data, **kwargs):
    #     if len(data['new_article']) > 1 and data['article_variation_parent'] is None:
    #         raise ValidationError("Dados de variação inválidos")

    #     if len(data['new_article']) > 1:
    #         sku_list = []
    #         for article in data['new_article']:
    #             if article['sku'] in sku_list:
    #                 raise ValidationError("Variações com SKU duplicado!")
    #             else:
    #                 sku_list.append(article['sku'])


class EditArticleSkuSchema(Schema):
    class Meta:
        pass
    
    id = Integer(
        required=True,
        error_messages={
            'required' : "O campo 'id' é obrigatório"
        }
    )
    new_sku = String(
        validate=Length(min=1),
        required=True,
        error_messages={
            'required' : "O campo 'novo SKU' é obrigatório"
        }
    )
