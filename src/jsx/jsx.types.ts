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
      accesskey?: any;
      anchor?: any;
      autocapitalize?: any;
      autofocus?: any;
      class?: any;
      contenteditable?: any;
      dir?: any;
      draggable?: any;
      enterkeyhint?: any;
      exportparts?: any;
      hidden?: any;
      id?: any;
      inert?: any;
      inputmode?: any;
      is?: any;
      itemid?: any;
      itemprop?: any;
      itemref?: any;
      itemscope?: any;
      itemtype?: any;
      lang?: any;
      nonce?: any;
      part?: any;
      popover?: any;
      role?:
        | "alert"
        | "alertdialog"
        | "application"
        | "article"
        | "banner"
        | "button"
        | "cell"
        | "checkbox"
        | "columnheader"
        | "combobox"
        | "command"
        | "comment"
        | "complementary"
        | "composite"
        | "contentinfo"
        | "definition"
        | "dialog"
        | "document"
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
        | "structure"
        | "suggestion"
        | "switch"
        | "tab"
        | "table"
        | "tablist"
        | "tabpanel"
        | "term"
        | "textbox"
        | "timer"
        | "toolbar"
        | "tooltip"
        | "tree"
        | "treegrid"
        | "treeitem"
        | "widget"
        | "window";
      slot?: any;
      spellcheck?: any;
      style?: any;
      tabindex?: any;
      title?: any;
      translate?: any;
      virtualkeyboardpolicy?: any;
      writingsuggestions?: any;
    }

    interface EventHandlerAttributes {
      onabort?: any;
      onautocomplete?: any;
      onautocompleteerror?: any;
      onblur?: any;
      oncancel?: any;
      oncanplay?: any;
      oncanplaythrough?: any;
      onchange?: any;
      onclick?: any;
      onclose?: any;
      oncontextmenu?: any;
      oncuechange?: any;
      ondblclick?: any;
      ondrag?: any;
      ondragend?: any;
      ondragenter?: any;
      ondragleave?: any;
      ondragover?: any;
      ondragstart?: any;
      ondrop?: any;
      ondurationchange?: any;
      onemptied?: any;
      onended?: any;
      onerror?: any;
      onfocus?: any;
      oninput?: any;
      oninvalid?: any;
      onkeydown?: any;
      onkeypress?: any;
      onkeyup?: any;
      onload?: any;
      onloadeddata?: any;
      onloadedmetadata?: any;
      onloadstart?: any;
      onmousedown?: any;
      onmouseenter?: any;
      onmouseleave?: any;
      onmousemove?: any;
      onmouseout?: any;
      onmouseover?: any;
      onmouseup?: any;
      onmousewheel?: any;
      onpause?: any;
      onplay?: any;
      onplaying?: any;
      onprogress?: any;
      onratechange?: any;
      onreset?: any;
      onresize?: any;
      onscroll?: any;
      onseeked?: any;
      onseeking?: any;
      onselect?: any;
      onshow?: any;
      onsort?: any;
      onstalled?: any;
      onsubmit?: any;
      onsuspend?: any;
      ontimeupdate?: any;
      ontoggle?: any;
      onvolumechange?: any;
      onwaiting?: any;
    }

    interface AriaAttributes {
      "aria-activedescendant"?: any;
      "aria-atomic"?: any;
      "aria-autocomplete"?: any;
      "aria-braillelabel"?: any;
      "aria-brailleroledescription"?: any;
      "aria-busy"?: any;
      "aria-checked"?: any;
      "aria-colcount"?: any;
      "aria-colindex"?: any;
      "aria-colindextext"?: any;
      "aria-colspan"?: any;
      "aria-controls"?: any;
      "aria-current"?: any;
      "aria-describedby"?: any;
      "aria-description"?: any;
      "aria-details"?: any;
      "aria-disabled"?: any;
      "aria-errormessage"?: any;
      "aria-expanded"?: any;
      "aria-flowto"?: any;
      "aria-haspopup"?: any;
      "aria-hidden"?: any;
      "aria-invalid"?: any;
      "aria-keyshortcuts"?: any;
      "aria-label"?: any;
      "aria-labelledby"?: any;
      "aria-level"?: any;
      "aria-live"?: any;
      "aria-modal"?: any;
      "aria-multiline"?: any;
      "aria-multiselectable"?: any;
      "aria-orientation"?: any;
      "aria-owns"?: any;
      "aria-placeholder"?: any;
      "aria-posinset"?: any;
      "aria-pressed"?: any;
      "aria-readonly"?: any;
      "aria-relevant"?: any;
      "aria-required"?: any;
      "aria-roledescription"?: any;
      "aria-rowcount"?: any;
      "aria-rowindex"?: any;
      "aria-rowindextext"?: any;
      "aria-rowspan"?: any;
      "aria-selected"?: any;
      "aria-setsize"?: any;
      "aria-sort"?: any;
      "aria-valuemax"?: any;
      "aria-valuemin"?: any;
      "aria-valuenow"?: any;
      "aria-valuetext"?: any;
    }
    type HTMLAttributes =
      | GlobalAttributes
      | EventHandlerAttributes
      | AriaAttributes
      | { [key: string]: any };

    interface IntrinsicElements {
      // Allow unknown elements
      [key: string]: any;

      // HTML
      a:
        | {
            attributionsrc?: any;
            download?: any;
            href?: any;
            hreflang?: any;
            media?: any;
            ping?: any;
            referrerpolicy?: any;
            rel?: any;
            target?: any;
            type?: any;
            /** @deprecated */
            charset?: any;
            /** @deprecated */
            coords?: any;
            /** @deprecated */
            name?: any;
            /** @deprecated */
            rev?: any;
            /** @deprecated */
            shape?: any;
          }
        | HTMLAttributes;
      abbr: HTMLAttributes;
      /** @deprecated */
      acronym: HTMLAttributes;
      address: HTMLAttributes;
      area:
        | {
            alt?: any;
            coords?: any;
            download?: any;
            href?: any;
            hreflang?: any;
            media?: any;
            ping?: any;
            referrerpolicy?: any;
            rel?: any;
            shape?: any;
            target?: any;
            type?: any;
          }
        | HTMLAttributes;
      article: HTMLAttributes;
      aside: HTMLAttributes;
      audio:
        | {
            autoplay?: any;
            controls?: any;
            controlslist?: any;
            crossorigin?: any;
            disableremoteplayback?: any;
            loop?: any;
            muted?: any;
            preload?: any;
            src?: any;
          }
        | HTMLAttributes;
      b: HTMLAttributes;
      base:
        | {
            href?: any;
            target?: any;
          }
        | HTMLAttributes;
      bdi: HTMLAttributes;
      bdo:
        | {
            dir?: any;
          }
        | HTMLAttributes;
      /** @deprecated */
      big: HTMLAttributes;
      blockquote:
        | {
            cite?: any;
          }
        | HTMLAttributes;
      body:
        | {
            /** @deprecated */
            alink?: any;
            /** @deprecated */
            background?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            bottommargin?: any;
            /** @deprecated */
            leftmargin?: any;
            /** @deprecated */
            link?: any;
            onafterprint?: any;
            onbeforeprint?: any;
            onbeforeunload?: any;
            onblur?: any;
            onerror?: any;
            onfocus?: any;
            onhashchange?: any;
            onlanguagechange?: any;
            onload?: any;
            onmessage?: any;
            onoffline?: any;
            ononline?: any;
            onpopstate?: any;
            onresize?: any;
            onstorage?: any;
            onunload?: any;
            /** @deprecated */
            rightmargin?: any;
            /** @deprecated */
            text?: any;
            /** @deprecated */
            topmargin?: any;
            /** @deprecated */
            vlink?: any;
          }
        | HTMLAttributes;
      br:
        | {
            /** @deprecated */
            clear?: any;
          }
        | HTMLAttributes;
      button:
        | {
            autofocus?: any;
            disabled?: any;
            form?: any;
            formaction?: any;
            formenctype?: any;
            formmethod?: any;
            formnovalidate?: any;
            formtarget?: any;
            name?: any;
            popovertarget?: any;
            popovertargetaction?: any;
            type?: any;
            value?: any;
          }
        | HTMLAttributes;
      canvas:
        | {
            height?: any;
            /** @deprecated */
            "moz-opaque"?: any;
            width?: any;
          }
        | HTMLAttributes;
      caption:
        | {
            /** @deprecated */
            align?: any;
          }
        | HTMLAttributes;
      /** @deprecated */
      center: HTMLAttributes;
      cite: HTMLAttributes;
      code: HTMLAttributes;
      col:
        | {
            span?: any;
            /** @deprecated */
            align?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            char?: any;
            /** @deprecated */
            charoff?: any;
            /** @deprecated */
            valign?: any;
            /** @deprecated */
            width?: any;
          }
        | HTMLAttributes;
      colgroup:
        | {
            span?: any;
            /** @deprecated */
            align?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            char?: any;
            /** @deprecated */
            charoff?: any;
            /** @deprecated */
            valign?: any;
            /** @deprecated */
            width?: any;
          }
        | HTMLAttributes;
      data:
        | {
            value?: any;
          }
        | HTMLAttributes;
      datalist: HTMLAttributes;
      dd: HTMLAttributes;
      del:
        | {
            cite?: any;
            datetime?: any;
          }
        | HTMLAttributes;
      details:
        | {
            open?: any;
            name?: any;
          }
        | HTMLAttributes;
      dfn: HTMLAttributes;
      dialog:
        | {
            open?: any;
          }
        | HTMLAttributes;
      /** @deprecated */
      dir:
        | {
            /** @deprecated */
            compact?: any;
          }
        | HTMLAttributes;
      div: HTMLAttributes;
      dl: HTMLAttributes;
      dt: HTMLAttributes;
      em: HTMLAttributes;
      embed:
        | {
            height?: any;
            src?: any;
            type?: any;
            width?: any;
          }
        | HTMLAttributes;
      fencedframe:
        | {
            allow?: any;
            height?: any;
            width?: any;
          }
        | HTMLAttributes;
      fieldset:
        | {
            disabled?: any;
            form?: any;
            name?: any;
          }
        | HTMLAttributes;
      figcaption: HTMLAttributes;
      figure: HTMLAttributes;
      /** @deprecated */
      font:
        | {
            /** @deprecated */
            color?: any;
            /** @deprecated */
            face?: any;
            /** @deprecated */
            size?: any;
          }
        | HTMLAttributes;
      footer: HTMLAttributes;
      form:
        | {
            /** @deprecated */
            accept?: any;
            "accept-charset"?: any;
            action?: any;
            autocomplete?: any;
            enctype?: any;
            method?: any;
            name?: any;
            novalidate?: any;
            rel?: any;
            target?: any;
          }
        | HTMLAttributes;
      /** @deprecated */
      frame:
        | {
            /** @deprecated */
            src?: any;
            /** @deprecated */
            name?: any;
            /** @deprecated */
            noresize?: any;
            /** @deprecated */
            scrolling?: any;
            /** @deprecated */
            marginheight?: any;
            /** @deprecated */
            marginwidth?: any;
            /** @deprecated */
            frameborder?: any;
          }
        | HTMLAttributes;
      /** @deprecated */
      frameset:
        | {
            /** @deprecated */
            cols?: any;
            /** @deprecated */
            rows?: any;
          }
        | HTMLAttributes;
      h1: HTMLAttributes;
      h2: HTMLAttributes;
      h3: HTMLAttributes;
      h4: HTMLAttributes;
      h5: HTMLAttributes;
      h6: HTMLAttributes;
      head:
        | {
            /** @deprecated */
            profile?: any;
          }
        | HTMLAttributes;
      header: HTMLAttributes;
      hgroup: HTMLAttributes;
      hr:
        | {
            /** @deprecated */
            align?: any;
            /** @deprecated */
            color?: any;
            /** @deprecated */
            noshade?: any;
            /** @deprecated */
            size?: any;
            /** @deprecated */
            width?: any;
          }
        | HTMLAttributes;
      html:
        | {
            /** @deprecated */
            version?: any;
            xmlns?: any;
          }
        | HTMLAttributes;
      i: HTMLAttributes;
      iframe:
        | {
            allow?: any;
            allowfullscreen?: any;
            /** @deprecated */
            allowpaymentrequest?: any;
            browsingtopics?: any;
            credentialless?: any;
            csp?: any;
            height?: any;
            loading?: any;
            name?: any;
            referrerpolicy?: any;
            sandbox?: any;
            src?: any;
            srcdoc?: any;
            width?: any;
            /** @deprecated */
            align?: any;
            /** @deprecated */
            frameborder?: any;
            /** @deprecated */
            longdesc?: any;
            /** @deprecated */
            marginheight?: any;
            /** @deprecated */
            marginwidth?: any;
            /** @deprecated */
            scrolling?: any;
          }
        | HTMLAttributes;
      img:
        | {
            alt?: any;
            attributionsrc?: any;
            crossorigin?: any;
            decoding?: any;
            elementtiming?: any;
            fetchpriority?: any;
            height?: any;
            intrinsicsize?: any;
            ismap?: any;
            loading?: any;
            referrerpolicy?: any;
            sizes?: any;
            src?: any;
            srcset?: any;
            width?: any;
            usemap?: any;
            /** @deprecated */
            align?: any;
            /** @deprecated */
            border?: any;
            /** @deprecated */
            hspace?: any;
            /** @deprecated */
            longdesc?: any;
            /** @deprecated */
            name?: any;
            /** @deprecated */
            vspace?: any;
          }
        | HTMLAttributes;
      input:
        | {
            accept?: any;
            alt?: any;
            autocapitalize?: any;
            autocomplete?: any;
            autocorrect?: any;
            autofocus?: any;
            capture?: any;
            checked?: any;
            dirname?: any;
            disabled?: any;
            form?: any;
            formaction?: any;
            formenctype?: any;
            formmethod?: any;
            formnovalidate?: any;
            formtarget?: any;
            height?: any;
            incremental?: any;
            id?: any;
            inputmode?: any;
            list?: any;
            max?: any;
            maxlength?: any;
            min?: any;
            minlength?: any;
            multiple?: any;
            name?: any;
            orient?: any;
            pattern?: any;
            placeholder?: any;
            popovertarget?: any;
            popovertargetaction?: any;
            readonly?: any;
            results?: any;
            required?: any;
            size?: any;
            src?: any;
            step?: any;
            tabindex?: any;
            title?: any;
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
            value?: any;
            webkitdirectory?: any;
            width?: any;
          }
        | HTMLAttributes;
      ins:
        | {
            cite?: any;
            datetime?: any;
          }
        | HTMLAttributes;
      kbd: HTMLAttributes;
      label:
        | {
            for?: any;
          }
        | HTMLAttributes;
      legend: HTMLAttributes;
      li:
        | {
            value?: any;
            /** @deprecated */
            type?: any;
          }
        | HTMLAttributes;
      link:
        | {
            as?: any;
            blocking?: any;
            crossorigin?: any;
            disabled?: any;
            fetchpriority?: any;
            href?: any;
            hreflang?: any;
            imagesizes?: any;
            imagesrcset?: any;
            integrity?: any;
            media?: any;
            referrerpolicy?: any;
            rel?: any;
            sizes?: any;
            title?: any;
            type?: any;
          }
        | HTMLAttributes;
      main: HTMLAttributes;
      map:
        | {
            name?: any;
          }
        | HTMLAttributes;
      mark: HTMLAttributes;
      /** @deprecated */
      marquee:
        | {
            /** @deprecated */
            behavior?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            direction?: any;
            /** @deprecated */
            height?: any;
            /** @deprecated */
            hspace?: any;
            /** @deprecated */
            loop?: any;
            /** @deprecated */
            scrollamount?: any;
            /** @deprecated */
            scrolldelay?: any;
            /** @deprecated */
            truespeed?: any;
            /** @deprecated */
            vspace?: any;
            /** @deprecated */
            width?: any;
          }
        | HTMLAttributes;
      menu: HTMLAttributes;
      meta:
        | {
            charset?: any;
            content?: any;
            "http-equiv"?: any;
            name?: any;
          }
        | HTMLAttributes;
      meter:
        | {
            value?: any;
            min?: any;
            max?: any;
            low?: any;
            high?: any;
            optimum?: any;
            form?: any;
          }
        | HTMLAttributes;
      nav: HTMLAttributes;
      /** @deprecated */
      nobr: HTMLAttributes;
      /** @deprecated */
      noembed: HTMLAttributes;
      /** @deprecated */
      noframes: HTMLAttributes;
      noscript: HTMLAttributes;
      object:
        | {
            /** @deprecated */
            archive?: any;
            /** @deprecated */
            border?: any;
            /** @deprecated */
            classid?: any;
            /** @deprecated */
            codebase?: any;
            /** @deprecated */
            codetype?: any;
            data?: any;
            /** @deprecated */
            declare?: any;
            form?: any;
            height?: any;
            name?: any;
            /** @deprecated */
            standby?: any;
            type?: any;
            /** @deprecated */
            usemap?: any;
            width?: any;
          }
        | HTMLAttributes;
      ol:
        | {
            reversed?: any;
            start?: any;
            type?: any;
          }
        | HTMLAttributes;
      optgroup:
        | {
            disabled?: any;
            label?: any;
          }
        | HTMLAttributes;
      option:
        | {
            disabled?: any;
            label?: any;
            selected?: any;
            value?: any;
          }
        | HTMLAttributes;
      output:
        | {
            for?: any;
            form?: any;
            name?: any;
          }
        | HTMLAttributes;
      p: HTMLAttributes;
      /** @deprecated */
      param:
        | {
            /** @deprecated */
            name?: any;
            /** @deprecated */
            value?: any;
            /** @deprecated */
            type?: any;
            /** @deprecated */
            valuetype?: any;
          }
        | HTMLAttributes;
      picture: HTMLAttributes;
      /** @deprecated */
      plaintext: HTMLAttributes;
      portal:
        | {
            referrerpolicy?: any;
            src?: any;
          }
        | HTMLAttributes;
      pre:
        | {
            /** @deprecated */
            width?: any;
            /** @deprecated */
            wrap?: any;
          }
        | HTMLAttributes;
      progress:
        | {
            max?: any;
            value?: any;
          }
        | HTMLAttributes;
      q:
        | {
            cite?: any;
          }
        | HTMLAttributes;
      /** @deprecated */
      rb: HTMLAttributes;
      rp: HTMLAttributes;
      rt: HTMLAttributes;
      /** @deprecated */
      rtc: HTMLAttributes;
      ruby: HTMLAttributes;
      s: HTMLAttributes;
      samp: HTMLAttributes;
      script:
        | {
            async?: any;
            attributionsrc?: any;
            blocking?: any;
            crossorigin?: any;
            defer?: any;
            fetchpriority?: any;
            integrity?: any;
            nomodule?: any;
            nonce?: any;
            referrerpolicy?: any;
            src?: any;
            type?: any;
            /** @deprecated */
            charset?: any;
            /** @deprecated */
            language?: any;
          }
        | HTMLAttributes;
      search: HTMLAttributes;
      section: HTMLAttributes;
      select:
        | {
            autocomplete?: any;
            autofocus?: any;
            disabled?: any;
            form?: any;
            multiple?: any;
            name?: any;
            required?: any;
            size?: any;
          }
        | HTMLAttributes;
      slot:
        | {
            name?: any;
          }
        | HTMLAttributes;
      small: HTMLAttributes;
      source:
        | {
            type?: any;
            src?: any;
            srcset?: any;
            sizes?: any;
            media?: any;
            height?: any;
            width?: any;
          }
        | HTMLAttributes;
      span: HTMLAttributes;
      /** @deprecated */
      strike: HTMLAttributes;
      strong: HTMLAttributes;
      style:
        | {
            blocking?: any;
            media?: any;
            nonce?: any;
            title?: any;
            /** @deprecated */
            type?: any;
          }
        | HTMLAttributes;
      sub: HTMLAttributes;
      summary: HTMLAttributes;
      sup: HTMLAttributes;
      table:
        | {
            /** @deprecated */
            align?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            border?: any;
            /** @deprecated */
            cellpadding?: any;
            /** @deprecated */
            cellspacing?: any;
            /** @deprecated */
            frame?: any;
            /** @deprecated */
            rules?: any;
            /** @deprecated */
            summary?: any;
            /** @deprecated */
            width?: any;
          }
        | HTMLAttributes;
      tbody:
        | {
            /** @deprecated */
            align?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            char?: any;
            /** @deprecated */
            charoff?: any;
            /** @deprecated */
            valign?: any;
          }
        | HTMLAttributes;
      td:
        | {
            colspan?: any;
            headers?: any;
            rowspan?: any;
            /** @deprecated */
            abbr?: any;
            /** @deprecated */
            align?: any;
            /** @deprecated */
            axis?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            char?: any;
            /** @deprecated */
            charoff?: any;
            /** @deprecated */
            height?: any;
            /** @deprecated */
            scope?: any;
            /** @deprecated */
            valign?: any;
            /** @deprecated */
            width?: any;
          }
        | HTMLAttributes;
      template:
        | {
            shadowrootmode?: any;
            shadowrootclonable?: any;
            shadowrootdelegatesfocus?: any;
            shadowrootserializable?: any;
          }
        | HTMLAttributes;
      textarea:
        | {
            autocapitalize?: any;
            autocomplete?: any;
            autocorrect?: any;
            autofocus?: any;
            cols?: any;
            dirname?: any;
            disabled?: any;
            enterkeyhint?: any;
            form?: any;
            maxlength?: any;
            minlength?: any;
            name?: any;
            placeholder?: any;
            readonly?: any;
            required?: any;
            rows?: any;
            spellcheck?: any;
            wrap?: any;
          }
        | HTMLAttributes;
      tfoot:
        | {
            /** @deprecated */
            align?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            char?: any;
            /** @deprecated */
            charoff?: any;
            /** @deprecated */
            valign?: any;
          }
        | HTMLAttributes;
      th:
        | {
            abbr?: any;
            colspan?: any;
            headers?: any;
            rowspan?: any;
            scope?: any;
            /** @deprecated */
            align?: any;
            /** @deprecated */
            axis?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            char?: any;
            /** @deprecated */
            charoff?: any;
            /** @deprecated */
            height?: any;
            /** @deprecated */
            valign?: any;
            /** @deprecated */
            width?: any;
          }
        | HTMLAttributes;
      thead:
        | {
            /** @deprecated */
            align?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            char?: any;
            /** @deprecated */
            charoff?: any;
            /** @deprecated */
            valign?: any;
          }
        | HTMLAttributes;
      time:
        | {
            datetime?: any;
          }
        | HTMLAttributes;
      title: HTMLAttributes;
      tr:
        | {
            /** @deprecated */
            align?: any;
            /** @deprecated */
            bgcolor?: any;
            /** @deprecated */
            char?: any;
            /** @deprecated */
            charoff?: any;
            /** @deprecated */
            valign?: any;
          }
        | HTMLAttributes;
      track:
        | {
            default?: any;
            kind?: any;
            label?: any;
            src?: any;
            srclang?: any;
          }
        | HTMLAttributes;
      /** @deprecated */
      tt: HTMLAttributes;
      u: HTMLAttributes;
      ul:
        | {
            /** @deprecated */
            compact?: any;
            /** @deprecated */
            type?: any;
          }
        | HTMLAttributes;
      var: HTMLAttributes;
      video:
        | {
            autoplay?: any;
            controls?: any;
            controlslist?: any;
            crossorigin?: any;
            disablepictureinpicture?: any;
            disableremoteplayback?: any;
            height?: any;
            loop?: any;
            muted?: any;
            playsinline?: any;
            poster?: any;
            preload?: any;
            src?: any;
            width?: any;
          }
        | HTMLAttributes;
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
