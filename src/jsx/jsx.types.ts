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

    interface GlobalAttributes {
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
      class?: string | { [key: string]: boolean };
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
        | "none presentation";
      slot?: string;
      spellcheck?: "" | "true" | "false" | boolean;
      style?: string | { [key: string]: string | number };
      tabindex?: number | string;
      title?: string;
      translate?: "" | "yes" | "no" | boolean;
      virtualkeyboardpolicy?: "auto" | "manual" | "none";
      writingsuggestions?: "" | "true" | "false" | boolean;
    }

    interface EventHandlerAttributes {
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
    }

    interface AriaAttributes {
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
    }

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

    interface IntrinsicElements {
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
        rel?: RelAttributes | `${RelAttributes} ${RelAttributes}`;
        target?: "_self" | "_blank" | "_parent" | "_top" | string;
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
        rel?: RelAttributes | `${RelAttributes} ${RelAttributes}`;
        shape?: "default" | "rect" | "circle" | "poly";
        target?: "_self" | "_blank" | "_parent" | "_top" | string;
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
        target?: "_self" | "_blank" | "_parent" | "_top" | string;
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
        formtarget?: "_self" | "_blank" | "_parent" | "_top" | string;
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
        rel?: RelAttributes | `${RelAttributes} ${RelAttributes}`;
        target?: "_self" | "_blank" | "_parent" | "_top" | string;
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
        formtarget?: "_self" | "_blank" | "_parent" | "_top" | string;
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
        rel?: RelAttributes | `${RelAttributes} ${RelAttributes}`;
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
          | "refresh";
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
          | "robots";
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

      // SVG
      svg: any;
      animate: any;
      animateMotion: any;
      animateTransform: any;
      circle: any;
      clipPath: any;
      defs: any;
      desc: any;
      ellipse: any;
      feBlend: any;
      feColorMatrix: any;
      feComponentTransfer: any;
      feComposite: any;
      feConvolveMatrix: any;
      feDiffuseLighting: any;
      feDisplacementMap: any;
      feDistantLight: any;
      feDropShadow: any;
      feFlood: any;
      feFuncA: any;
      feFuncB: any;
      feFuncG: any;
      feFuncR: any;
      feGaussianBlur: any;
      feImage: any;
      feMerge: any;
      feMergeNode: any;
      feMorphology: any;
      feOffset: any;
      fePointLight: any;
      feSpecularLighting: any;
      feSpotLight: any;
      feTile: any;
      feTurbulence: any;
      filter: any;
      foreignObject: any;
      g: any;
      image: any;
      line: any;
      linearGradient: any;
      marker: any;
      mask: any;
      metadata: any;
      mpath: any;
      path: any;
      pattern: any;
      polygon: any;
      polyline: any;
      radialGradient: any;
      rect: any;
      set: any;
      stop: any;
      switch: any;
      symbol: any;
      text: any;
      textPath: any;
      tspan: any;
      use: any;
      view: any;

      // MathML
      math: any;
      annotation: any;
      "annotation-xml": any;
      menclose: any;
      merror: any;
      mfrac: any;
      mi: any;
      mmultiscripts: any;
      mn: any;
      mo: any;
      mover: any;
      mpadded: any;
      mphantom: any;
      mprescripts: any;
      mroot: any;
      mrow: any;
      ms: any;
      mspace: any;
      msqrt: any;
      mstyle: any;
      msub: any;
      msup: any;
      msubsup: any;
      mtable: any;
      mtd: any;
      mtext: any;
      mtr: any;
      munder: any;
      munderover: any;
      semantics: any;
    }
  }
}
