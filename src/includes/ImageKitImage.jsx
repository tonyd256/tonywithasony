import Image from 'next/image';

const loader = ({ src, width, quality }) => `${src}?tr=w-${width},q-${quality}`;

const ImageKitImage = props => (
  <Image loader={loader} {...props} />
);

export default ImageKitImage;
