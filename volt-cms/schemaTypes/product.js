export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name (English)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'nameIt',
      title: 'Product Name (Italian)',
      type: 'string',
    },
    {
      name: 'price',
      title: 'Price ($)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Shirts', value: 'Shirts' },
          { title: 'Pants', value: 'Pants' },
          { title: 'Shoes', value: 'Shoes' },
          { title: 'Machines', value: 'Machines' },
          { title: 'Tools', value: 'Tools' },
        ],
      },
    },
    {
      name: 'image',
      title: 'Main Image (Thumbnail)',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'gallery',
      title: 'Product Gallery (Up to 4 Images for Carousel)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.max(4),
      description: 'Upload up to 4 extra images to scroll through when viewing the product modal.',
    },
    {
      name: 'description',
      title: 'Description (English)',
      type: 'text',
    },
    {
      name: 'descriptionIt',
      title: 'Description (Italian)',
      type: 'text',
    },
  ],
}