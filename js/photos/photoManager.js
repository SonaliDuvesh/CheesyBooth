
export class PhotoManager {
  constructor() {
    this.photos = [];
    this.targetCount = 4;
    this.activeFilter = 'warm-vintage';
    this.listeners = new Set();
  }

  setTargetCount(count) {
    this.targetCount = parseInt(count, 10) || 4;
    this.notify();
  }

  setFilter(filterId) {
    this.activeFilter = filterId;
    this.notify();
  }

  addPhoto(photoData, timestamp) {
    let imgData = '';
    let ts = timestamp || Date.now();
    let w = 1200;
    let h = 960;

    if (typeof photoData === 'string') {
      imgData = photoData;
    } else if (photoData && typeof photoData === 'object') {
      imgData = photoData.imageData || photoData.dataUrl || photoData.url || photoData.src || '';
      ts = photoData.timestamp || ts;
      w = photoData.width || w;
      h = photoData.height || h;
    }

    const photo = {
      id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      imageData: imgData,
      timestamp: ts,
      width: w,
      height: h,
      order: this.photos.length,
      filter: this.activeFilter,
    };
    this.photos.push(photo);
    this.notify();
    return photo;
  }

  clear() {
    this.clearPhotos();
  }

  replacePhotoAt(index, photoData) {
    if (index >= 0 && index < this.photos.length) {
      let imgData = '';
      let ts = Date.now();
      let w = this.photos[index].width || 1200;
      let h = this.photos[index].height || 960;

      if (typeof photoData === 'string') {
        imgData = photoData;
      } else if (photoData && typeof photoData === 'object') {
        imgData = photoData.imageData || photoData.dataUrl || photoData.url || photoData.src || '';
        ts = photoData.timestamp || ts;
        w = photoData.width || w;
        h = photoData.height || h;
      }

      this.photos[index] = {
        ...this.photos[index],
        imageData: imgData || this.photos[index].imageData,
        timestamp: ts,
        width: w,
        height: h,
      };
      this.notify();
      return this.photos[index];
    }
    return null;
  }

  deletePhoto(index) {
    if (index >= 0 && index < this.photos.length) {
      this.photos.splice(index, 1);

      this.photos.forEach((p, idx) => { p.order = idx; });
      this.notify();
    }
  }

  reorderPhoto(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.photos.length || toIndex < 0 || toIndex >= this.photos.length) {
      return;
    }
    const [moved] = this.photos.splice(fromIndex, 1);
    this.photos.splice(toIndex, 0, moved);
    this.photos.forEach((p, idx) => { p.order = idx; });
    this.notify();
  }

  insertPhotoAt(index, photo) {
    if (index < 0) index = 0;
    if (index > this.photos.length) index = this.photos.length;
    this.photos.splice(index, 0, photo);
    this.photos.forEach((p, idx) => { p.order = idx; });
    this.notify();
  }

  setPhotos(newPhotos) {
    this.photos = [...newPhotos];
    this.photos.forEach((p, idx) => { p.order = idx; });
    this.notify();
  }

  clearPhotos() {
    this.photos = [];
    this.notify();
  }

  getAll() {
    return [...this.photos];
  }

  get count() {
    return this.photos.length;
  }

  get isComplete() {
    return this.photos.length >= this.targetCount;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getAll(), this.targetCount));
  }
}
