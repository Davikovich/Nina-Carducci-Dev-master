(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }
      $.fn.mauGallery.listeners(options);

      $(this)
        .children(".gallery-item")
        .each(function(index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };
  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    $(".gallery").on("click", ".nav-link", function(event) {
    $.fn.mauGallery.methods.filterByTag(event);
    });
    $(".gallery").on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    $(".gallery").on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
  $.fn.mauGallery.methods = {
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },
    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
    
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
    
      if (activeTag === "all") {
        $(".item-column").each(function () {
          const img = $(this).find("img.gallery-item");
          if (img.length) imagesCollection.push(img);
        });
      } else {
        $(".item-column").each(function () {
          const img = $(this).find("img.gallery-item");
          if (img.data("gallery-tag") === activeTag) {
            imagesCollection.push(img);
          }
        });
      }
    
      let index = 0;
      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
    
      const prevIndex = (index - 1 + imagesCollection.length) % imagesCollection.length;
      const prev = imagesCollection[prevIndex];
      $(".lightboxImage").attr("src", $(prev).attr("src"));
    },
    
    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
    
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
    
      if (activeTag === "all") {
        $(".item-column").each(function () {
          const img = $(this).find("img.gallery-item");
          if (img.length) imagesCollection.push(img);
        });
      } else {
        $(".item-column").each(function () {
          const img = $(this).find("img.gallery-item");
          if (img.data("gallery-tag") === activeTag) {
            imagesCollection.push(img);
          }
        });
      }
    
      let index = 0;
      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
    
      const nextIndex = (index + 1) % imagesCollection.length;
      const next = imagesCollection[nextIndex];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },
    
    createLightBox(gallery, lightboxId, navigation) {
      const id = lightboxId || "galleryLightbox";
      const navButtons = navigation
        ? `
          <button type="button" class="mg-prev btn btn-light position-absolute top-50 start-0 translate-middle-y z-3" style="opacity: 0.7; font-size: 1.5rem;">‹</button>
          <button type="button" class="mg-next btn btn-light position-absolute top-50 end-0 translate-middle-y z-3" style="opacity: 0.7; font-size: 1.5rem;">›</button>
        `
        : "";
    
      gallery.append(`
        <div class="modal fade" id="${id}" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content bg-transparent border-0">
              <div class="modal-body position-relative text-center">
                ${navButtons}
                <img class="lightboxImage img-fluid" alt="Image affichée dans la lightbox" />
              </div>
            </div>
          </div>
        </div>
      `);
    }, 
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><a class="nav-link active active-tag" data-images-toggle="all" role="button">Tous</a></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
  <a class="nav-link" data-images-toggle="${value}" role="button">${value}</a></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },
    filterByTag(event) {
      $(".active-tag").removeClass("active active-tag");
      $(event.currentTarget).addClass("active active-tag");
    
      var tag = $(event.currentTarget).data("images-toggle");
    
      $(".gallery-item").each(function () {
        $(this).parents(".item-column").hide();
        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          $(this).parents(".item-column").show(300);
        }
      });
    }
  };
})(jQuery);