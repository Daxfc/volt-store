import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: 'it74h5ul',
  dataset: 'production',
  apiVersion: '2026-03-01',
  useCdn: true,
});

const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);