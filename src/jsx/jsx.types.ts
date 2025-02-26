export type Tag = {
  type: "tag";
  tag: (props: Props) => JSX.Element;
  props: Props;
};

type Props = {
  [k: string]: any;
  children?: JSX.Children;
};

type TextNode = {
  type: "textNode";
  text: string;
};

declare global {
  namespace JSX {
    type AsyncElement = Promise<SyncElement>;
    type SyncElement =
      | Tag
      | TextNode
      | null
      | undefined
      | boolean
      | string
      | number;
    type Element = SyncElement | AsyncElement;
    type Children = JSX.Element | Array<JSX.Element | Array<JSX.Element>>;

    type GlobalAttributes = {
      accesskey?: string;
      anchor?: string;
      autocapitalize?:
        | "off"
        | "none"
        | "on"
        | "sentences"
        | "words"
        | "characters";
      autofocus?: "" | "autofocus" | boolean;
      class?: string | string[] | { [key: string]: boolean };
      contenteditable?: "" | "true" | "false" | "plaintext-only" | boolean;
      dir?: "auto" | "rtl" | "ltr";
      draggable?: "true" | "false";
      enterkeyhint?:
        | "enter"
        | "done"
        | "go"
        | "next"
        | "previous"
        | "search"
        | "send";
      exportparts?: string;
      hidden?: "" | "hidden" | "until-found" | boolean;
      id?: string;
      inert?: "" | "inert" | boolean;
      inputmode?:
        | "none"
        | "text"
        | "tel"
        | "url"
        | "email"
        | "numeric"
        | "decimal"
        | "search";
      is?: string;
      itemid?: string;
      itemprop?: string;
      itemref?: string;
      itemscope?: "" | "itemscope" | boolean;
      itemtype?: string;
      lang?: string;
      nonce?: string;
      part?: string;
      popover?: "" | "auto" | "hint" | "manual" | boolean;
      role?:
        | "alert"
        | "alertdialog"
        | "application"
        | "article"
        | "banner"
        | "blockquote"
        | "button"
        | "caption"
        | "cell"
        | "checkbox"
        | "code"
        | "columnheader"
        | "combobox"
        | "command"
        | "comment"
        | "complementary"
        | "composite"
        | "contentinfo"
        | "definition"
        | "deletion"
        | "dialog"
        | "directory"
        | "document"
        | "emphasis"
        | "feed"
        | "figure"
        | "form"
        | "generic"
        | "grid"
        | "gridcell"
        | "group"
        | "heading"
        | "img"
        | "input"
        | "insertion"
        | "landmark"
        | "link"
        | "list"
        | "listbox"
        | "listitem"
        | "log"
        | "main"
        | "mark"
        | "marquee"
        | "math"
        | "menu"
        | "menubar"
        | "menuitem"
        | "menuitemcheckbox"
        | "menuitemradio"
        | "meter"
        | "navigation"
        | "none"
        | "note"
        | "option"
        | "paragraph"
        | "presentation"
        | "progressbar"
        | "radio"
        | "radiogroup"
        | "range"
        | "region"
        | "roletype"
        | "row"
        | "rowgroup"
        | "rowheader"
        | "scrollbar"
        | "search"
        | "searchbox"
        | "section"
        | "sectionhead"
        | "select"
        | "separator"
        | "slider"
        | "spinbutton"
        | "status"
        | "strong"
        | "structure"
        | "subscript"
        | "suggestion"
        | "superscript"
        | "switch"
        | "tab"
        | "table"
        | "tablist"
        | "tabpanel"
        | "term"
        | "textbox"
        | "time"
        | "timer"
        | "toolbar"
        | "tooltip"
        | "tree"
        | "treegrid"
        | "treeitem"
        | "widget"
        | "window"
        | "none presentation"
        | (string & {});
      slot?: string;
      spellcheck?: "" | "true" | "false" | boolean;
      style?: string | { [key: string]: string | number };
      tabindex?: number | string;
      title?: string;
      translate?: "" | "yes" | "no" | boolean;
      virtualkeyboardpolicy?: "auto" | "manual" | "none";
      writingsuggestions?: "" | "true" | "false" | boolean;
    };

    type EventHandlerAttributes = {
      onabort?: string;
      onautocomplete?: string;
      onautocompleteerror?: string;
      onblur?: string;
      oncancel?: string;
      oncanplay?: string;
      oncanplaythrough?: string;
      onchange?: string;
      onclick?: string;
      onclose?: string;
      oncontextmenu?: string;
      oncuechange?: string;
      ondblclick?: string;
      ondrag?: string;
      ondragend?: string;
      ondragenter?: string;
      ondragleave?: string;
      ondragover?: string;
      ondragstart?: string;
      ondrop?: string;
      ondurationchange?: string;
      onemptied?: string;
      onended?: string;
      onerror?: string;
      onfocus?: string;
      oninput?: string;
      oninvalid?: string;
      onkeydown?: string;
      onkeypress?: string;
      onkeyup?: string;
      onload?: string;
      onloadeddata?: string;
      onloadedmetadata?: string;
      onloadstart?: string;
      onmousedown?: string;
      onmouseenter?: string;
      onmouseleave?: string;
      onmousemove?: string;
      onmouseout?: string;
      onmouseover?: string;
      onmouseup?: string;
      onmousewheel?: string;
      onpause?: string;
      onplay?: string;
      onplaying?: string;
      onprogress?: string;
      onratechange?: string;
      onreset?: string;
      onresize?: string;
      onscroll?: string;
      onseeked?: string;
      onseeking?: string;
      onselect?: string;
      onshow?: string;
      onsort?: string;
      onstalled?: string;
      onsubmit?: string;
      onsuspend?: string;
      ontimeupdate?: string;
      ontoggle?: string;
      onvolumechange?: string;
      onwaiting?: string;
    };

    type AriaAttributes = {
      "aria-activedescendant"?: string;
      "aria-atomic"?: "false" | "true" | boolean;
      "aria-autocomplete"?: "none" | "inline" | "list" | "both";
      "aria-braillelabel"?: string;
      "aria-brailleroledescription"?: string;
      "aria-busy"?: "false" | "true" | boolean;
      "aria-checked"?: "false" | "mixed" | "true" | boolean;
      "aria-colcount"?: number | string;
      "aria-colindex"?: number | string;
      "aria-colindextext"?: string;
      "aria-colspan"?: number | string;
      "aria-controls"?: string;
      "aria-current"?:
        | "false"
        | "true"
        | "page"
        | "step"
        | "location"
        | "date"
        | "time"
        | boolean;
      "aria-describedby"?: string;
      "aria-description"?: string;
      "aria-details"?: string;
      "aria-disabled"?: "false" | "true" | boolean;
      "aria-dropeffect"?:
        | "none"
        | "copy"
        | "execute"
        | "link"
        | "move"
        | "popup";
      "aria-errormessage"?: string;
      "aria-expanded"?: "false" | "true" | boolean;
      "aria-flowto"?: string;
      "aria-grabbed"?: "false" | "true" | boolean;
      "aria-haspopup"?:
        | "false"
        | "true"
        | "menu"
        | "listbox"
        | "tree"
        | "grid"
        | "dialog"
        | boolean;
      "aria-hidden"?: "false" | "true" | boolean;
      "aria-invalid"?: "false" | "true" | "grammar" | "spelling" | boolean;
      "aria-keyshortcuts"?: string;
      "aria-label"?: string;
      "aria-labelledby"?: string;
      "aria-level"?: number | string;
      "aria-live"?: "off" | "assertive" | "polite";
      "aria-modal"?: "false" | "true" | boolean;
      "aria-multiline"?: "false" | "true" | boolean;
      "aria-multiselectable"?: "false" | "true" | boolean;
      "aria-orientation"?: "horizontal" | "vertical";
      "aria-owns"?: string;
      "aria-placeholder"?: string;
      "aria-posinset"?: number | string;
      "aria-pressed"?: "mixed" | "false" | "true" | boolean;
      "aria-readonly"?: "false" | "true" | boolean;
      "aria-relevant"?:
        | "additions"
        | "additions removals"
        | "additions text"
        | "all"
        | "removals"
        | "removals additions"
        | "removals text"
        | "text"
        | "text additions"
        | "text removals";
      "aria-required"?: "false" | "true" | boolean;
      "aria-roledescription"?: string;
      "aria-rowcount"?: number | string;
      "aria-rowindex"?: number | string;
      "aria-rowindextext"?: string;
      "aria-rowspan"?: number | string;
      "aria-selected"?: "false" | "true" | boolean;
      "aria-setsize"?: number | string;
      "aria-sort"?: "none" | "ascending" | "descending" | "other";
      "aria-valuemax"?: number | string;
      "aria-valuemin"?: number | string;
      "aria-valuenow"?: number | string;
      "aria-valuetext"?: string;
    };

    type RelAttributes =
      | "about"
      | "acl"
      | "alternate"
      | "amphtml"
      | "api-catalog"
      | "appendix"
      | "apple-touch-icon"
      | "apple-touch-startup-image"
      | "archives"
      | "author"
      | "blocked-by"
      | "bookmark"
      | "c2pa-manifest"
      | "canonical"
      | "chapter"
      | "cite-as"
      | "collection"
      | "compression-dictionary"
      | "contents"
      | "convertedfrom"
      | "copyright"
      | "create-form"
      | "current"
      | "deprecation"
      | "describedby"
      | "describes"
      | "disclosure"
      | "dns-prefetch"
      | "duplicate"
      | "edit"
      | "edit-form"
      | "edit-media"
      | "enclosure"
      | "external"
      | "first"
      | "glossary"
      | "help"
      | "hosts"
      | "hub"
      | "ice-server"
      | "icon"
      | "index"
      | "intervalafter"
      | "intervalbefore"
      | "intervalcontains"
      | "intervaldisjoint"
      | "intervalduring"
      | "intervalequals"
      | "intervalfinishedby"
      | "intervalfinishes"
      | "intervalin"
      | "intervalmeets"
      | "intervalmetby"
      | "intervaloverlappedby"
      | "intervaloverlaps"
      | "intervalstartedby"
      | "intervalstarts"
      | "item"
      | "last"
      | "latest-version"
      | "license"
      | "linkset"
      | "lrdd"
      | "manifest"
      | "mask-icon"
      | "me"
      | "media-feed"
      | "memento"
      | "micropub"
      | "modulepreload"
      | "monitor"
      | "monitor-group"
      | "next"
      | "next-archive"
      | "nofollow"
      | "noopener"
      | "noreferrer"
      | "opener"
      | "openid2.local_id"
      | "openid2.provider"
      | "original"
      | "p3pv1"
      | "payment"
      | "pingback"
      | "preconnect"
      | "predecessor-version"
      | "prefetch"
      | "preload"
      | "prerender"
      | "prev"
      | "preview"
      | "previous"
      | "prev-archive"
      | "privacy-policy"
      | "profile"
      | "publication"
      | "related"
      | "restconf"
      | "replies"
      | "ruleinput"
      | "search"
      | "section"
      | "self"
      | "service"
      | "service-desc"
      | "service-doc"
      | "service-meta"
      | "sip-trunking-capability"
      | "sponsored"
      | "start"
      | "status"
      | "stylesheet"
      | "subsection"
      | "successor-version"
      | "sunset"
      | "tag"
      | "terms-of-service"
      | "timegate"
      | "timemap"
      | "type"
      | "ugc"
      | "up"
      | "version-history"
      | "via"
      | "webmention"
      | "working-copy"
      | "working-copy-of";

    type ReferrerPolicyAttributes =
      | "no-referrer"
      | "no-referrer-when-downgrade"
      | "origin"
      | "origin-when-cross-origin"
      | "same-origin"
      | "strict-origin"
      | "strict-origin-when-cross-origin"
      | "unsafe-url";

    type HTMLAttributes = GlobalAttributes &
      EventHandlerAttributes &
      AriaAttributes & {
        [key: string]: string | number | boolean | object;
      };

    type SVGAttributes = {
      /**@deprecated */
      accelerate?: number | string;
      /**@deprecated */
      "accent-height"?: number | string;
      accumulate?: "none" | "sum";
      additive?: "replace" | "sum";
      "alignment-baseline"?:
        | "auto"
        | "baseline"
        | "before-edge"
        | "text-before-edge"
        | "middle"
        | "central"
        | "after-edge"
        | "text-after-edge"
        | "ideographic"
        | "alphabetic"
        | "hanging"
        | "mathematical"
        | "top"
        | "center"
        | "bottom";
      /**@deprecated */
      alphabetic?: number | string;
      amplitude?: number | string;
      /** @deprecated */
      "arabic-form"?: "initial" | "medial" | "terminal" | "isolated";
      /**@deprecated */
      ascent?: number | string;
      attributeName?: string;
      /**@deprecated */
      attributeType?: "CSS" | "XML" | "auto";
      azimuth?: number | string;
      baseFrequency?: number | string;
      /** @deprecated */
      "baseline-shift"?: number | "sub" | "super" | (string & {});
      /** @deprecated */
      baseProfile?: number | string;
      /** @deprecated */
      bbox?: string;
      begin?: string;
      bias?: number | string;
      by?: number | string;
      calcMode?: "discrete" | "linear" | "paced" | "spline";
      /** @deprecated */
      "cap-height"?: number | string;
      class?: string | string[] | { [key: string]: boolean };
      /** @deprecated */
      clip?: "auto" | (string & {});
      "clip-path"?: "none" | (string & {});
      "clip-rule"?: "nonzero" | "evenodd" | "inherit";
      clipPathUnits?: "userSpaceOnUse" | "objectBoundingBox";
      color?: number | "inherit" | (string & {});
      "color-interpolation"?: "auto" | "sRGB" | "linearRGB";
      "color-interpolation-filters"?: "auto" | "sRGB" | "linearRGB";
      cursor?:
        | "auto"
        | "crosshair"
        | "default"
        | "pointer"
        | "move"
        | "e-resize"
        | "ne-resize"
        | "nw-resize"
        | "n-resize"
        | "se-resize"
        | "sw-resize"
        | "s-resize"
        | "w-resize"
        | "text"
        | "wait"
        | "help"
        | "inherit"
        | (string & {});
      cx?: number | string;
      cy?: number | string;
      d?: string;
      /**@deprecated */
      decelerate?: number | string;
      decoding?: "sync" | "async" | "auto";
      /**@deprecated */
      descent?: number | string;
      diffuseConstant?: number | string;
      direction?: "ltr" | "rtl";
      display?: string;
      divisor?: number | string;
      "dominant-baseline"?:
        | "auto"
        | "text-bottom"
        | "alphabetic"
        | "ideographic"
        | "middle"
        | "central"
        | "mathematical"
        | "hanging"
        | "text-top";
      dur?: number | "media" | "indefinite" | (string & {});
      dx?: number | string;
      dy?: number | string;
      edgeMode?: "duplicate" | "wrap" | "none";
      elevation?: number | string;
      "enable-background"?: number | string;
      end?: number | string;
      exponent?: number | string;
      fill?: string;
      "fill-opacity"?: number | string;
      "fill-rule"?: "nonzero" | "evenodd";
      filter?: string;
      filterUnits?: "userSpaceOnUse" | "objectBoundingBox";
      "flood-color"?: number | string;
      "flood-opacity"?: number | string;
      font?: string;
      "font-family"?: string;
      "font-size"?: number | string;
      "font-size-adjust"?: number | string;
      "font-stretch"?: number | string;
      "font-style"?: "normal" | "italic" | "oblique";
      "font-variant"?: number | string;
      "font-weight"?:
        | number
        | "normal"
        | "bold"
        | "bolder"
        | "lighter"
        | (string & {});
      fr?: number | string;
      from?: number | string;
      fx?: number | string;
      fy?: number | string;
      /**@deprecated */
      g1?: number | string;
      /**@deprecated */
      g2?: number | string;
      /**@deprecated */
      "glyph-name"?: number | string;
      /**@deprecated */
      "glyph-orientation-horizontal"?: number | string;
      /**@deprecated */
      "glyph-orientation-vertical"?: number | string;
      glyphRef?: number | string;
      gradientTransform?: string;
      gradientUnits?: "userSpaceOnUse" | "objectBoundingBox";
      /**@deprecated */
      hanging?: number | string;
      height?: number | string;
      /**@deprecated */
      "horiz-adv-x"?: number | string;
      /**@deprecated */
      "horiz-origin-x"?: number | string;
      /**@deprecated */
      "horiz-origin-y"?: number | string;
      href?: string;
      id?: string;
      /**@deprecated */
      ideographic?: number | string;
      "image-rendering"?: "auto" | "optimizeSpeed" | "optimizeQuality";
      in?:
        | "SourceGraphic"
        | "SourceAlpha"
        | "BackgroundImage"
        | "BackgroundAlpha"
        | "FillPaint"
        | "StrokePaint"
        | (string & {});
      in2?:
        | "SourceGraphic"
        | "SourceAlpha"
        | "BackgroundImage"
        | "BackgroundAlpha"
        | "FillPaint"
        | "StrokePaint"
        | (string & {});
      intercept?: number | string;
      isolation?: "auto" | "isolate";
      /**@deprecated */
      k?: number | string;
      k1?: number | string;
      k2?: number | string;
      k3?: number | string;
      k4?: number | string;
      kernelMatrix?: number | string;
      kernelUnitLength?: number | string;
      /**@deprecated */
      kerning?: number | string;
      keyPoints?: number | string;
      keySplines?: number | string;
      keyTimes?: number | string;
      lang?: string;
      lengthAdjust?: "spacing" | "spacingAndGlyphs";
      "letter-spacing"?: number | "normal" | (string & {});
      "lighting-color"?: number | string;
      limitingConeAngle?: number | string;
      marker?: string;
      "marker-end"?: "none" | (string & {});
      "marker-mid"?: "none" | (string & {});
      "marker-start"?: "none" | (string & {});
      markerHeight?: number | string;
      markerUnits?: "userSpaceOnUse" | "strokeWidth";
      markerWidth?: number | string;
      mask?: string;
      maskContentUnits?: "userSpaceOnUse" | "objectBoundingBox";
      maskUnits?: "userSpaceOnUse" | "objectBoundingBox";
      /**@deprecated */
      mathematical?: number | string;
      max?: number | string;
      media?: number | string;
      method?: "align" | "stretch";
      min?: number | string;
      mode?: number | string;
      /**@deprecated */
      name?: number | string;
      numOctaves?: number | string;
      offset?: number | string;
      opacity?: number | string;
      operator?:
        | "over"
        | "in"
        | "out"
        | "atop"
        | "xor"
        | "lighter"
        | "arithmetic"
        | "erode"
        | "dilate";
      order?: number | string;
      orient?: number | "auto" | "auto-start-reverse" | (string & {});
      /**@deprecated */
      orientation?: "h" | "v";
      origin?: "default";
      overflow?: "visible" | "hidden" | "scroll" | "auto";
      "overline-position"?: number | string;
      "overline-thickness"?: number | string;
      "paint-order"?: "normal" | "fill" | "stroke" | "markers";
      /**@deprecated */
      "panose-1"?: number | string;
      path?: number | string;
      pathLength?: number | string;
      patternContentUnits?: "userSpaceOnUse" | "objectBoundingBox";
      patternTransform?: number | string;
      patternUnits?: "userSpaceOnUse" | "objectBoundingBox";
      /**@deprecated */
      pitch?: number | string;
      "pointer-events"?:
        | "bounding-box"
        | "visiblePainted"
        | "visibleFill"
        | "visibleStroke"
        | "visible"
        | "painted"
        | "fill"
        | "stroke"
        | "all"
        | "none";
      points?: string;
      pointsAtX?: number | string;
      pointsAtY?: number | string;
      pointsAtZ?: number | string;
      preserveAlpha?: "true" | "false";
      preserveAspectRatio?: string;
      primitiveUnits?: "userSpaceOnUse" | "objectBoundingBox";
      r?: number | string;
      radius?: number | string;
      rel?: string;
      refX?: number | string;
      refY?: number | string;
      repeatCount?: number | "indefinite" | (string & {});
      repeatDur?: number | "indefinite" | (string & {});
      /**@deprecated */
      requiredExtensions?: number | string;
      /**@deprecated */
      requiredFeatures?: number | string;
      restart?: "always" | "whenNotActive" | "never";
      result?: string;
      rotate?: number | "auto" | "auto-reverse" | (string & {});
      rx?: number | "auto" | (string & {});
      ry?: number | "auto" | (string & {});
      scale?: number | string;
      seed?: number | string;
      "shape-rendering"?:
        | "auto"
        | "optimizeSpeed"
        | "crispEdges"
        | "geometricPrecision";
      side?: "left" | "right";
      slope?: number | string;
      spacing?: "auto" | "exact";
      specularConstant?: number | string;
      specularExponent?: number | string;
      speed?: number | string;
      spreadMethod?: "pad" | "reflect" | "repeat";
      startOffset?: number | string;
      stdDeviation?: number | string;
      /**@deprecated */
      stemh?: number | string;
      /**@deprecated */
      stemv?: number | string;
      stitchTiles?: "noStitch" | "stitch";
      "stop-color"?: number | string;
      "stop-opacity"?: number | string;
      "strikethrough-position"?: number | string;
      "strikethrough-thickness"?: number | string;
      /**@deprecated */
      string?: number | string;
      stroke?: number | string;
      "stroke-align"?: number | string;
      "stroke-dasharray"?: number | string;
      "stroke-dashadust"?: number | string;
      "stroke-dashcorner"?: number | string;
      "stroke-dashoffset"?: number | string;
      "stroke-linecap"?: "butt" | "round" | "square";
      "stroke-linejoin"?: "arcs" | "bevel" | "miter" | "miter-clip" | "round";
      "stroke-miterlimit"?: number | string;
      "stroke-opacity"?: number | string;
      "stroke-width"?: number | string;
      style?: string | { [key: string]: string | number };
      surfaceScale?: number | string;
      systemLanguage?: number | string;
      tabindex?: number | string;
      tableValues?: number | string;
      target?: "_self" | "_parent" | "_top" | "_blank" | (string & {});
      targetX?: number | string;
      targetY?: number | string;
      "text-anchor"?: "start" | "middle" | "end";
      "text-decoration"?: number | string;
      "text-rendering"?:
        | "auto"
        | "optimizeSpeed"
        | "optimizeLegibility"
        | "geometricPrecision";
      textLength?: number | string;
      to?: number | string;
      transform?: string;
      "transform-origin"?: string;
      type?: string;
      /**@deprecated */
      u1?: number | string;
      /**@deprecated */
      u2?: number | string;
      "underline-position"?: number | string;
      "underline-thickness"?: number | string;
      /**@deprecated */
      unicode?: number | string;
      "unicode-bidi"?: number | string;
      /**@deprecated */
      "unicode-range"?: number | string;
      /**@deprecated */
      "units-per-em"?: number | string;
      /**@deprecated */
      "v-alphabetic"?: number | string;
      /**@deprecated */
      "v-hanging"?: number | string;
      /**@deprecated */
      "v-ideographic"?: number | string;
      /**@deprecated */
      "v-mathematical"?: number | string;
      values?: string;
      "vector-effect"?:
        | "none"
        | "non-scaling-stroke"
        | "non-scaling-size"
        | "non-rotation"
        | "fixed-position";
      /**@deprecated */
      version?: string;
      /**@deprecated */
      "vert-adv-y"?: number | string;
      /**@deprecated */
      "vert-origin-x"?: number | string;
      /**@deprecated */
      "vert-origin-y"?: number | string;
      viewBox?: string | undefined;
      visibility?: "visible" | "hidden" | "collapse";
      width?: number | string;
      /**@deprecated */
      widths?: number | string;
      "word-spacing"?: number | "normal" | (string & {});
      "writing-mode"?: "horizontal-tb" | "vertical-rl" | "vertical-lr";
      x?: number | string;
      /**@deprecated */
      "x-height"?: number | string;
      x1?: number | string;
      x2?: number | string;
      xChannelSelector?: "R" | "G" | "B" | "A";
      /**@deprecated */
      "xlink:actuate"?: string;
      /**@deprecated */
      "xlink:arcrole"?: string;
      /**@deprecated */
      "xlink:href"?: string;
      /**@deprecated */
      "xlink:show"?: "new" | "replace" | "embed" | "other" | "none";
      /**@deprecated */
      "xlink:title"?: string;
      /**@deprecated */
      "xlink:type"?: string;
      /**@deprecated */
      "xml:lang"?: string;
      /**@deprecated */
      "xml:space"?: string;
      xmlns?: string;
      "xmlns:xlink"?: string;
      y?: number | string;
      y1?: number | string;
      y2?: number | string;
      yChannelSelector?: "R" | "G" | "B" | "A";
      z?: number | string;
      /**@deprecated */
      zoomAndPan?: "disable" | "magnify";
    } & {
      [key: string]: string | number | boolean | object;
    };

    type IntrinsicElements = {
      // Allow unknown elements
      [key: string]: unknown;

      // HTML
      a: {
        attributionsrc?: string;
        download?: boolean | string;
        href?: string;
        hreflang?: string;
        media?: string;
        ping?: string;
        referrerpolicy?: ReferrerPolicyAttributes;
        rel?:
          | RelAttributes
          | `${RelAttributes} ${RelAttributes}`
          | (string & {});
        target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
        type?: string;
        /** @deprecated */
        charset?: string;
        /** @deprecated */
        coords?: string;
        /** @deprecated */
        name?: string;
        /** @deprecated */
        rev?: string;
        /** @deprecated */
        shape?: "default" | "rect" | "circle" | "poly";
      } & HTMLAttributes;
      abbr: HTMLAttributes;
      /** @deprecated */
      acronym: HTMLAttributes;
      address: HTMLAttributes;
      area: {
        alt?: string;
        coords?: string;
        download?: string | boolean;
        href?: string;
        hreflang?: string;
        media?: string;
        ping?: string;
        referrerpolicy?: ReferrerPolicyAttributes;
        rel?:
          | RelAttributes
          | `${RelAttributes} ${RelAttributes}`
          | (string & {});
        shape?: "default" | "rect" | "circle" | "poly";
        target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
        type?: string;
      } & HTMLAttributes;
      article: HTMLAttributes;
      aside: HTMLAttributes;
      audio: {
        autoplay?: "" | "autoplay" | boolean;
        controls?: "" | "controls" | boolean;
        controlslist?: string;
        crossorigin?: "" | "anonymous" | "use-credentials";
        disableremoteplayback?: "" | "disableremoteplayback" | boolean;
        loop?: "" | "loop" | boolean;
        muted?: "" | "muted" | boolean;
        preload?: "" | "auto" | "none" | "metadata";
        src?: string;
      } & HTMLAttributes;
      b: HTMLAttributes;
      base: {
        href?: string;
        target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
      } & HTMLAttributes;
      bdi: HTMLAttributes;
      bdo: {
        dir?: "ltr" | "rtl" | "auto";
      } & HTMLAttributes;
      /** @deprecated */
      big: HTMLAttributes;
      blockquote: {
        cite?: string;
      } & HTMLAttributes;
      body: {
        /** @deprecated */
        alink?: string;
        /** @deprecated */
        background?: string;
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        bottommargin?: number | string;
        /** @deprecated */
        leftmargin?: number | string;
        /** @deprecated */
        link?: string;
        onafterprint?: string;
        onbeforeprint?: string;
        onbeforeunload?: string;
        onblur?: string;
        onerror?: string;
        onfocus?: string;
        onhashchange?: string;
        onlanguagechange?: string;
        onload?: string;
        onmessage?: string;
        onoffline?: string;
        ononline?: string;
        onpopstate?: string;
        onresize?: string;
        onstorage?: string;
        onunload?: string;
        /** @deprecated */
        rightmargin?: number | string;
        /** @deprecated */
        text?: string;
        /** @deprecated */
        topmargin?: number | string;
        /** @deprecated */
        vlink?: string;
      } & HTMLAttributes;
      br: {
        /** @deprecated */
        clear?: "none" | "left" | "right" | "both";
      } & HTMLAttributes;
      button: {
        disabled?: "" | "disabled" | boolean;
        form?: string;
        formaction?: string;
        formenctype?:
          | "application/x-www-form-urlencoded"
          | "multipart/form-data"
          | "text/plain";
        formmethod?: "post" | "get" | "dialog";
        formnovalidate?: "" | "formnovalidate" | boolean;
        formtarget?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
        name?: string;
        popovertarget?: string;
        popovertargetaction?: "show" | "hide" | "toggle";
        type?: "submit" | "reset" | "button";
        value?: string | number;
      } & HTMLAttributes;
      canvas: {
        height?: number | string;
        /** @deprecated */
        "moz-opaque"?: boolean | string;
        width?: number | string;
      } & HTMLAttributes;
      caption: {
        /** @deprecated */
        align?: "left" | "right" | "center" | "justify";
      } & HTMLAttributes;
      /** @deprecated */
      center: HTMLAttributes;
      cite: HTMLAttributes;
      code: HTMLAttributes;
      col: {
        span?: number | string;
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        char?: string;
        /** @deprecated */
        charoff?: string;
        /** @deprecated */
        valign?: "top" | "middle" | "bottom" | "baseline";
        /** @deprecated */
        width?: number | string;
      } & HTMLAttributes;
      colgroup: {
        span?: number | string;
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        char?: string;
        /** @deprecated */
        charoff?: string;
        /** @deprecated */
        valign?: "top" | "middle" | "bottom" | "baseline";
        /** @deprecated */
        width?: number | string;
      } & HTMLAttributes;
      data: {
        value?: string | number;
      } & HTMLAttributes;
      datalist: HTMLAttributes;
      dd: HTMLAttributes;
      del: {
        cite?: string;
        datetime?: string;
      } & HTMLAttributes;
      details: {
        open?: "" | "open" | boolean;
        name?: string;
      } & HTMLAttributes;
      dfn: HTMLAttributes;
      dialog: {
        open?: "" | "open" | boolean;
      } & HTMLAttributes;
      /** @deprecated */
      dir: {
        /** @deprecated */
        compact?: boolean | string;
      } & HTMLAttributes;
      div: HTMLAttributes;
      dl: HTMLAttributes;
      dt: HTMLAttributes;
      em: HTMLAttributes;
      embed: {
        height?: number | string;
        src?: string;
        type?: string;
        width?: number | string;
      } & HTMLAttributes;
      fencedframe: {
        allow?: string;
        height?: number | string;
        width?: number | string;
      } & HTMLAttributes;
      fieldset: {
        disabled?: "" | "disabled" | boolean;
        form?: string;
        name?: string;
      } & HTMLAttributes;
      figcaption: HTMLAttributes;
      figure: HTMLAttributes;
      /** @deprecated */
      font: {
        /** @deprecated */
        color?: string;
        /** @deprecated */
        face?: string;
        /** @deprecated */
        size?: number | string;
      } & HTMLAttributes;
      footer: HTMLAttributes;
      form: {
        /** @deprecated */
        accept?: string;
        "accept-charset"?: string;
        action?: string;
        autocomplete?: "on" | "off" | string;
        enctype?:
          | "application/x-www-form-urlencoded"
          | "multipart/form-data"
          | "text/plain";
        method?: "post" | "get" | "dialog";
        name?: string;
        novalidate?: "" | "novalidate" | boolean;
        rel?:
          | RelAttributes
          | `${RelAttributes} ${RelAttributes}`
          | (string & {});
        target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
      } & HTMLAttributes;
      /** @deprecated */
      frame: {
        /** @deprecated */
        src?: string;
        /** @deprecated */
        name?: string;
        /** @deprecated */
        noresize?: "" | "noresize" | boolean;
        /** @deprecated */
        scrolling?: "yes" | "no" | "auto";
        /** @deprecated */
        marginheight?: number | string;
        /** @deprecated */
        marginwidth?: number | string;
        /** @deprecated */
        frameborder?: number | string;
      } & HTMLAttributes;
      /** @deprecated */
      frameset: {
        /** @deprecated */
        cols?: number | string;
        /** @deprecated */
        rows?: number | string;
      } & HTMLAttributes;
      h1: HTMLAttributes;
      h2: HTMLAttributes;
      h3: HTMLAttributes;
      h4: HTMLAttributes;
      h5: HTMLAttributes;
      h6: HTMLAttributes;
      head: {
        /** @deprecated */
        profile?: string;
      } & HTMLAttributes;
      header: HTMLAttributes;
      hgroup: HTMLAttributes;
      hr: {
        /** @deprecated */
        align?: "left" | "center" | "right";
        /** @deprecated */
        color?: string;
        /** @deprecated */
        noshade?: "" | "noshade" | boolean;
        /** @deprecated */
        size?: number | string;
        /** @deprecated */
        width?: number | string;
      } & HTMLAttributes;
      html: {
        /** @deprecated */
        version?: string;
        xmlns?: string;
      } & HTMLAttributes;
      i: HTMLAttributes;
      iframe: {
        allow?: string;
        allowfullscreen?: "" | "allowfullscreen" | boolean;
        /** @deprecated */
        allowpaymentrequest?: "" | "allowpaymentrequest" | boolean;
        browsingtopics?: "" | "browsingtopics" | boolean;
        credentialless?: "" | "credentialless" | boolean;
        csp?: string;
        height?: number | string;
        loading?: "eager" | "lazy";
        name?: string;
        referrerpolicy?: ReferrerPolicyAttributes;
        sandbox?: string;
        src?: string;
        srcdoc?: string;
        width?: number | string;
        /** @deprecated */
        align?: "left" | "center" | "right";
        /** @deprecated */
        frameborder?: number | string;
        /** @deprecated */
        longdesc?: string;
        /** @deprecated */
        marginheight?: number | string;
        /** @deprecated */
        marginwidth?: number | string;
        /** @deprecated */
        scrolling?: "yes" | "no" | "auto";
      } & HTMLAttributes;
      img: {
        alt?: string;
        attributionsrc?: string;
        crossorigin?: "" | "anonymous" | "use-credentials";
        decoding?: "sync" | "async" | "auto";
        elementtiming?: string;
        fetchpriority?: "high" | "low" | "auto";
        height?: number | string;
        intrinsicsize?: string;
        ismap?: "" | "ismap" | boolean;
        loading?: "eager" | "lazy";
        referrerpolicy?: ReferrerPolicyAttributes;
        sizes?: string;
        src?: string;
        srcset?: string;
        width?: number | string;
        usemap?: string;
        /** @deprecated */
        align?: "left" | "center" | "right" | "bottom" | "top";
        /** @deprecated */
        border?: string | number;
        /** @deprecated */
        hspace?: number | string;
        /** @deprecated */
        longdesc?: string;
        /** @deprecated */
        name?: string;
        /** @deprecated */
        vspace?: number | string;
      } & HTMLAttributes;
      input: {
        accept?: string;
        alt?: string;
        autocomplete?: "on" | "off" | string;
        autocorrect?: "on" | "off";
        capture?: boolean | "user" | "environment";
        checked?: "" | "checked" | boolean;
        dirname?: string;
        disabled?: "" | "disabled" | boolean;
        form?: string;
        formaction?: string;
        formenctype?:
          | "application/x-www-form-urlencoded"
          | "multipart/form-data"
          | "text/plain";
        formmethod?: "post" | "get" | "dialog";
        formnovalidate?: "" | "formnovalidate" | boolean;
        formtarget?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
        height?: number | string;
        incremental?: boolean | string;
        id?: string;
        inputmode?:
          | "none"
          | "text"
          | "tel"
          | "url"
          | "email"
          | "numeric"
          | "decimal"
          | "search";
        list?: string;
        max?: number | string;
        maxlength?: number | string;
        min?: number | string;
        minlength?: number | string;
        multiple?: "" | "multiple" | boolean;
        name?: string;
        orient?: "horizontal" | "vertical";
        pattern?: string;
        placeholder?: string;
        popovertarget?: string;
        popovertargetaction?: "show" | "hide" | "toggle";
        readonly?: "" | "readonly" | boolean;
        results?: number | string;
        required?: "" | "required" | boolean;
        size?: number | string;
        src?: string;
        step?: number | string;
        tabindex?: number | string;
        title?: string;
        type?:
          | "button"
          | "checkbox"
          | "color"
          | "date"
          | "datetime-local"
          | "email"
          | "file"
          | "hidden"
          | "image"
          | "month"
          | "number"
          | "password"
          | "radio"
          | "range"
          | "reset"
          | "search"
          | "submit"
          | "tel"
          | "text"
          | "time"
          | "url"
          | "week";
        value?: string | number;
        webkitdirectory?: "" | "webkitdirectory" | boolean;
        width?: number | string;
      } & HTMLAttributes;
      ins: {
        cite?: string;
        datetime?: string;
      } & HTMLAttributes;
      kbd: HTMLAttributes;
      label: {
        for?: string;
      } & HTMLAttributes;
      legend: HTMLAttributes;
      li: {
        value?: string | number;
        /** @deprecated */
        type?: string;
      } & HTMLAttributes;
      link: {
        as?: string;
        blocking?: "render" | "script" | "style";
        crossorigin?: "anonymous" | "use-credentials" | "";
        disabled?: "" | "disabled" | boolean;
        fetchpriority?: "high" | "low" | "auto";
        href?: string;
        hreflang?: string;
        imagesizes?: string;
        imagesrcset?: string;
        integrity?: string;
        media?: string;
        referrerpolicy?: ReferrerPolicyAttributes;
        rel?:
          | RelAttributes
          | `${RelAttributes} ${RelAttributes}`
          | (string & {});
        sizes?: string;
        title?: string;
        type?: string;
      } & HTMLAttributes;
      main: HTMLAttributes;
      map: {
        name?: string;
      } & HTMLAttributes;
      mark: HTMLAttributes;
      /** @deprecated */
      marquee: {
        /** @deprecated */
        behavior?: "scroll" | "slide" | "alternate";
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        direction?: "left" | "right" | "up" | "down";
        /** @deprecated */
        height?: number | string;
        /** @deprecated */
        hspace?: number | string;
        /** @deprecated */
        loop?: number | string;
        /** @deprecated */
        scrollamount?: number | string;
        /** @deprecated */
        scrolldelay?: number | string;
        /** @deprecated */
        truespeed?: boolean | string;
        /** @deprecated */
        vspace?: number | string;
        /** @deprecated */
        width?: number | string;
      } & HTMLAttributes;
      menu: HTMLAttributes;
      meta: {
        charset?: string;
        content?: string;
        "http-equiv"?:
          | "content-security-policy"
          | "content-type"
          | "default-style"
          | "x-ua-compatible"
          | "refresh"
          | (string & {});
        name?:
          | "application-name"
          | "author"
          | "description"
          | "generator"
          | "keywords"
          | "referrer"
          | "theme-color"
          | "color-scheme"
          | "viewport"
          | "creator"
          | "googlebot"
          | "publisher"
          | "robots"
          | (string & {});
      } & HTMLAttributes;
      meter: {
        value?: number | string;
        min?: number | string;
        max?: number | string;
        low?: number | string;
        high?: number | string;
        optimum?: number | string;
        form?: string;
      } & HTMLAttributes;
      nav: HTMLAttributes;
      /** @deprecated */
      nobr: HTMLAttributes;
      /** @deprecated */
      noembed: HTMLAttributes;
      /** @deprecated */
      noframes: HTMLAttributes;
      noscript: HTMLAttributes;
      object: {
        /** @deprecated */
        archive?: string;
        /** @deprecated */
        border?: string | number;
        /** @deprecated */
        classid?: string;
        /** @deprecated */
        codebase?: string;
        /** @deprecated */
        codetype?: string;
        data?: string;
        /** @deprecated */
        declare?: "" | "declare" | boolean;
        form?: string;
        height?: number | string;
        name?: string;
        /** @deprecated */
        standby?: string;
        type?: string;
        /** @deprecated */
        usemap?: string;
        width?: number | string;
      } & HTMLAttributes;
      ol: {
        reversed?: "" | "reversed" | boolean;
        start?: number | string;
        type?: "1" | "a" | "A" | "i" | "I";
      } & HTMLAttributes;
      optgroup: {
        disabled?: "" | "disabled" | boolean;
        label?: string;
      } & HTMLAttributes;
      option: {
        disabled?: "" | "disabled" | boolean;
        label?: string;
        selected?: "" | "selected" | boolean;
        value?: string | number;
      } & HTMLAttributes;
      output: {
        for?: string;
        form?: string;
        name?: string;
      } & HTMLAttributes;
      p: HTMLAttributes;
      /** @deprecated */
      param: {
        /** @deprecated */
        name?: string;
        /** @deprecated */
        value?: string;
        /** @deprecated */
        type?: string;
        /** @deprecated */
        valuetype?: "data" | "ref" | "object";
      } & HTMLAttributes;
      picture: HTMLAttributes;
      /** @deprecated */
      plaintext: HTMLAttributes;
      portal: {
        referrerpolicy?: ReferrerPolicyAttributes;
        src?: string;
      } & HTMLAttributes;
      pre: {
        /** @deprecated */
        width?: number | string;
        /** @deprecated */
        wrap?: "hard" | "soft" | "off";
      } & HTMLAttributes;
      progress: {
        max?: number | string;
        value?: string | number;
      } & HTMLAttributes;
      q: {
        cite?: string;
      } & HTMLAttributes;
      /** @deprecated */
      rb: HTMLAttributes;
      rp: HTMLAttributes;
      rt: HTMLAttributes;
      /** @deprecated */
      rtc: HTMLAttributes;
      ruby: HTMLAttributes;
      s: HTMLAttributes;
      samp: HTMLAttributes;
      script: {
        async?: "" | "async" | boolean;
        attributionsrc?: string;
        blocking?: "render" | "script" | "style";
        crossorigin?: "anonymous" | "use-credentials" | "";
        defer?: "" | "defer" | boolean;
        fetchpriority?: "high" | "low" | "auto";
        integrity?: string;
        nomodule?: "" | "nomodule" | boolean;
        nonce?: string;
        referrerpolicy?: ReferrerPolicyAttributes;
        src?: string;
        type?: string;
        /** @deprecated */
        charset?: string;
        /** @deprecated */
        language?: string;
      } & HTMLAttributes;
      search: HTMLAttributes;
      section: HTMLAttributes;
      select: {
        autocomplete?: "on" | "off" | string;
        disabled?: "" | "disabled" | boolean;
        form?: string;
        multiple?: "" | "multiple" | boolean;
        name?: string;
        required?: "" | "required" | boolean;
        size?: number | string;
      } & HTMLAttributes;
      slot: {
        name?: string;
      } & HTMLAttributes;
      small: HTMLAttributes;
      source: {
        type?: string;
        src?: string;
        srcset?: string;
        sizes?: string;
        media?: string;
        height?: number | string;
        width?: number | string;
      } & HTMLAttributes;
      span: HTMLAttributes;
      /** @deprecated */
      strike: HTMLAttributes;
      strong: HTMLAttributes;
      style: {
        blocking?: "render" | "script" | "style";
        media?: string;
        nonce?: string;
        title?: string;
        /** @deprecated */
        type?: string;
      } & HTMLAttributes;
      sub: HTMLAttributes;
      summary: HTMLAttributes;
      sup: HTMLAttributes;
      table: {
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        border?: string | number;
        /** @deprecated */
        cellpadding?: string | number;
        /** @deprecated */
        cellspacing?: string | number;
        /** @deprecated */
        frame?:
          | "void"
          | "above"
          | "below"
          | "hsides"
          | "lhs"
          | "rhs"
          | "vsides"
          | "box"
          | "border";
        /** @deprecated */
        rules?: "none" | "groups" | "rows" | "cols" | "all";
        /** @deprecated */
        summary?: string;
        /** @deprecated */
        width?: string | number;
      } & HTMLAttributes;
      tbody: {
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        char?: string;
        /** @deprecated */
        charoff?: string;
        /** @deprecated */
        valign?: "top" | "middle" | "bottom" | "baseline";
      } & HTMLAttributes;
      td: {
        colspan?: number | string;
        headers?: string;
        rowspan?: number | string;
        /** @deprecated */
        abbr?: string;
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        axis?: string;
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        char?: string;
        /** @deprecated */
        charoff?: string;
        /** @deprecated */
        height?: number | string;
        /** @deprecated */
        scope?: string;
        /** @deprecated */
        valign?: "top" | "middle" | "bottom" | "baseline";
        /** @deprecated */
        width?: number | string;
      } & HTMLAttributes;
      template: {
        shadowrootmode?: "open" | "closed";
        shadowrootclonable?: "" | "shadowrootclonable" | boolean;
        shadowrootdelegatesfocus?: "" | "shadowrootdelegatesfocus" | boolean;
        shadowrootserializable?: "" | "shadowrootserializable" | boolean;
      } & HTMLAttributes;
      textarea: {
        autocomplete?: "on" | "off" | string;
        autocorrect?: "on" | "off";
        cols?: number | string;
        dirname?: string;
        disabled?: "" | "disabled" | boolean;
        form?: string;
        maxlength?: number | string;
        minlength?: number | string;
        name?: string;
        placeholder?: string;
        readonly?: "" | "readonly" | boolean;
        required?: "" | "required" | boolean;
        rows?: number | string;
        wrap?: "hard" | "soft" | "off";
      } & HTMLAttributes;
      tfoot: {
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        char?: string;
        /** @deprecated */
        charoff?: string;
        /** @deprecated */
        valign?: "top" | "middle" | "bottom" | "baseline";
      } & HTMLAttributes;
      th: {
        abbr?: string;
        colspan?: number | string;
        headers?: string;
        rowspan?: number | string;
        scope?: string;
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        axis?: string;
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        char?: string;
        /** @deprecated */
        charoff?: string;
        /** @deprecated */
        height?: number | string;
        /** @deprecated */
        valign?: "top" | "middle" | "bottom" | "baseline";
        /** @deprecated */
        width?: number | string;
      } & HTMLAttributes;
      thead: {
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        char?: string;
        /** @deprecated */
        charoff?: string;
        /** @deprecated */
        valign?: "top" | "middle" | "bottom" | "baseline";
      } & HTMLAttributes;
      time: {
        datetime?: string;
      } & HTMLAttributes;
      title: HTMLAttributes;
      tr: {
        /** @deprecated */
        align?: "left" | "center" | "right" | "justify";
        /** @deprecated */
        bgcolor?: string;
        /** @deprecated */
        char?: string;
        /** @deprecated */
        charoff?: string;
        /** @deprecated */
        valign?: "top" | "middle" | "bottom" | "baseline";
      } & HTMLAttributes;
      track: {
        default?: "" | "default" | boolean;
        kind?: string;
        label?: string;
        src?: string;
        srclang?: string;
      } & HTMLAttributes;
      /** @deprecated */
      tt: HTMLAttributes;
      u: HTMLAttributes;
      ul: {
        /** @deprecated */
        compact?: boolean | string;
        /** @deprecated */
        type?: string;
      } & HTMLAttributes;
      var: HTMLAttributes;
      video: {
        autoplay?: "" | "autoplay" | boolean;
        controls?: "" | "controls" | boolean;
        controlslist?: string;
        crossorigin?: "" | "anonymous" | "use-credentials";
        disablepictureinpicture?: "" | "disablepictureinpicture" | boolean;
        disableremoteplayback?: "" | "disableremoteplayback" | boolean;
        height?: number | string;
        loop?: "" | "loop" | boolean;
        muted?: "" | "muted" | boolean;
        playsinline?: "" | "playsinline" | boolean;
        poster?: string;
        preload?: "" | "none" | "metadata" | "auto";
        src?: string;
        width?: number | string;
      } & HTMLAttributes;
      wbr: HTMLAttributes;
      /** @deprecated */
      xmp: HTMLAttributes;

      /* SVG */
      animate: SVGAttributes;
      animateMotion: SVGAttributes;
      animateTransform: SVGAttributes;
      circle: SVGAttributes;
      clipPath: SVGAttributes;
      /** @deprecated */
      cursor: SVGAttributes;
      defs: SVGAttributes;
      desc: SVGAttributes;
      ellipse: SVGAttributes;
      feBlend: SVGAttributes;
      feColorMatrix: SVGAttributes;
      feComponentTransfer: SVGAttributes;
      feComposite: SVGAttributes;
      feConvolveMatrix: SVGAttributes;
      feDiffuseLighting: SVGAttributes;
      feDisplacementMap: SVGAttributes;
      feDistantLight: SVGAttributes;
      feDropShadow: SVGAttributes;
      feFlood: SVGAttributes;
      feFuncA: SVGAttributes;
      feFuncB: SVGAttributes;
      feFuncG: SVGAttributes;
      feFuncR: SVGAttributes;
      feGaussianBlur: SVGAttributes;
      feImage: SVGAttributes;
      feMerge: SVGAttributes;
      feMergeNode: SVGAttributes;
      feMorphology: SVGAttributes;
      feOffset: SVGAttributes;
      fePointLight: SVGAttributes;
      feSpecularLighting: SVGAttributes;
      feSpotLight: SVGAttributes;
      feTile: SVGAttributes;
      feTurbulence: SVGAttributes;
      filter: SVGAttributes;
      /** @deprecated */
      "font-face-format": SVGAttributes;
      /** @deprecated */
      "font-face-name": SVGAttributes;
      /** @deprecated */
      "font-face-src": SVGAttributes;
      /** @deprecated */
      "font-face-uri": SVGAttributes;
      /** @deprecated */
      "font-face": SVGAttributes;
      /** @deprecated */
      foreignObject: SVGAttributes;
      g: SVGAttributes;
      /** @deprecated */
      glyph: SVGAttributes;
      /** @deprecated */
      glyphRef: SVGAttributes;
      /** @deprecated */
      hkern: SVGAttributes;
      image: SVGAttributes;
      line: SVGAttributes;
      linearGradient: SVGAttributes;
      marker: SVGAttributes;
      mask: SVGAttributes;
      metadata: SVGAttributes;
      /** @deprecated */
      "missing-glyph": SVGAttributes;
      mpath: SVGAttributes;
      path: SVGAttributes;
      pattern: SVGAttributes;
      polygon: SVGAttributes;
      polyline: SVGAttributes;
      radialGradient: SVGAttributes;
      rect: SVGAttributes;
      set: SVGAttributes;
      stop: SVGAttributes;
      svg: SVGAttributes;
      switch: SVGAttributes;
      symbol: SVGAttributes;
      text: SVGAttributes;
      textPath: SVGAttributes;
      /** @deprecated */
      tref: SVGAttributes;
      tspan: SVGAttributes;
      use: SVGAttributes;
      view: SVGAttributes;
      vkern: SVGAttributes;
    };
  }
}
