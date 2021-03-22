import L from "leaflet";

export interface Options {
  position: string;
  color: string;
  gray: string;
  bitonial: string;
  setQuality: (quality: string) => void;
}

(L.Control as any).IiifQuality = L.Control.extend({
  options: {
    position: "topleft",
    color: "The image is returned in full color",
    gray: "The image is returned in grayscale, where each pixel is black, white or any shade of gray in between.",
    bitonial: "The image returned is bitonal, where each pixel is either black or white.",
  },
  colorButton: null,
  grayButton: null,
  bitonalButton: null,
  changeQuality: function (quality: string) {
    if ((this as any).options.setQuality) {
      (this as any).options.setQuality(quality);
    } else {
      console.log("Changing quality to", quality);
    }
  },

  createButton: function (title: string, className: string, icon: string, container: any, fn: () => void) {
    // Modified from Leaflet zoom control
    var link: any = L.DomUtil.create("a", className, container);
    link.href = "#";
    link.title = title;
    link.innerHTML = `<i class='${icon}'></i>`;
    L.DomEvent.on(link, "mousedown dblclick", L.DomEvent.stopPropagation).on(link, "click", fn, this);
    return link;
  },
  onAdd: function (map: any) {
    var options = this.options;

    // Create toolbar
    var controlName = "leaflet-control-iiif-quality",
      container = L.DomUtil.create("div", controlName + " leaflet-bar");

    // Add toolbar buttons
    this.colorButton = this.createButton(options.color, controlName + "-color", "fas fa-palette", container, () =>
      this.changeQuality("color"),
    );
    this.grayButton = this.createButton(options.gray, controlName + "-gray", "fas fa-palette", container, () =>
      this.changeQuality("gray"),
    );
    this.bitonalButton = this.createButton(
      options.bitonial,
      controlName + "-bitonal",
      "fas fa-palette",
      container,
      () => this.changeQuality("bitonal"),
    );

    return container;
  },
});

(L.control as any).iiifQuality = function (options: Options) {
  return new (L.Control as any).IiifQuality(options);
};
