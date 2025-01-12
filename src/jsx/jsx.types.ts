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
      accesskey?: string | undefined;
      anchor?: string | undefined;
      autocapitalize?:
        | "off"
        | "none"
        | "on"
        | "sentences"
        | "words"
        | "characters"
        | undefined;
      autofocus?: "" | "autofocus" | boolean | undefined;
      class?: string | object | undefined;
      contenteditable?:
        | ""
        | "true"
        | "false"
        | "plaintext-only"
        | boolean
        | undefined;
      dir?: "auto" | "rtl" | "ltr" | undefined;
      draggable?: "true" | "false" | undefined;
      enterkeyhint?:
        | "enter"
        | "done"
        | "go"
        | "next"
        | "previous"
        | "search"
        | "send"
        | undefined;
      exportparts?: string | undefined;
      hidden?: "" | "hidden" | "until-found" | boolean | undefined;
      id?: string | undefined;
      inert?: "" | "inert" | boolean | undefined;
      inputmode?:
        | "none"
        | "text"
        | "tel"
        | "url"
        | "email"
        | "numeric"
        | "decimal"
        | "search"
        | undefined;
      is?: string | undefined;
      itemid?: string | undefined;
      itemprop?: string | undefined;
      itemref?: string | undefined;
      itemscope?: "" | "itemscope" | boolean | undefined;
      itemtype?: string | undefined;
      lang?: string | undefined;
      nonce?: string | undefined;
      part?: string | undefined;
      popover?: "" | "auto" | "hint" | "manual" | boolean | undefined;
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
      slot?: string | undefined;
      spellcheck?: "" | "true" | "false" | boolean | undefined;
      style?: string | object | undefined;
      tabindex?: number | string | undefined;
      title?: string | undefined;
      translate?: "" | "yes" | "no" | boolean | undefined;
      virtualkeyboardpolicy?: "auto" | "manual" | "none" | undefined;
      writingsuggestions?: "" | "true" | "false" | boolean | undefined;
    }

    interface EventHandlerAttributes {
      onabort?: string | undefined;
      onautocomplete?: string | undefined;
      onautocompleteerror?: string | undefined;
      onblur?: string | undefined;
      oncancel?: string | undefined;
      oncanplay?: string | undefined;
      oncanplaythrough?: string | undefined;
      onchange?: string | undefined;
      onclick?: string | undefined;
      onclose?: string | undefined;
      oncontextmenu?: string | undefined;
      oncuechange?: string | undefined;
      ondblclick?: string | undefined;
      ondrag?: string | undefined;
      ondragend?: string | undefined;
      ondragenter?: string | undefined;
      ondragleave?: string | undefined;
      ondragover?: string | undefined;
      ondragstart?: string | undefined;
      ondrop?: string | undefined;
      ondurationchange?: string | undefined;
      onemptied?: string | undefined;
      onended?: string | undefined;
      onerror?: string | undefined;
      onfocus?: string | undefined;
      oninput?: string | undefined;
      oninvalid?: string | undefined;
      onkeydown?: string | undefined;
      onkeypress?: string | undefined;
      onkeyup?: string | undefined;
      onload?: string | undefined;
      onloadeddata?: string | undefined;
      onloadedmetadata?: string | undefined;
      onloadstart?: string | undefined;
      onmousedown?: string | undefined;
      onmouseenter?: string | undefined;
      onmouseleave?: string | undefined;
      onmousemove?: string | undefined;
      onmouseout?: string | undefined;
      onmouseover?: string | undefined;
      onmouseup?: string | undefined;
      onmousewheel?: string | undefined;
      onpause?: string | undefined;
      onplay?: string | undefined;
      onplaying?: string | undefined;
      onprogress?: string | undefined;
      onratechange?: string | undefined;
      onreset?: string | undefined;
      onresize?: string | undefined;
      onscroll?: string | undefined;
      onseeked?: string | undefined;
      onseeking?: string | undefined;
      onselect?: string | undefined;
      onshow?: string | undefined;
      onsort?: string | undefined;
      onstalled?: string | undefined;
      onsubmit?: string | undefined;
      onsuspend?: string | undefined;
      ontimeupdate?: string | undefined;
      ontoggle?: string | undefined;
      onvolumechange?: string | undefined;
      onwaiting?: string | undefined;
    }

    interface AriaAttributes {
      "aria-activedescendant"?: string | undefined;
      "aria-atomic"?: "false" | "true" | boolean | undefined;
      "aria-autocomplete"?: "none" | "inline" | "list" | "both" | undefined;
      "aria-braillelabel"?: string | undefined;
      "aria-brailleroledescription"?: string | undefined;
      "aria-busy"?: "false" | "true" | boolean | undefined;
      "aria-checked"?: "false" | "mixed" | "true" | boolean | undefined;
      "aria-colcount"?: number | string | undefined;
      "aria-colindex"?: number | string | undefined;
      "aria-colindextext"?: string | undefined;
      "aria-colspan"?: number | string | undefined;
      "aria-controls"?: string | undefined;
      "aria-current"?:
        | "false"
        | "true"
        | "page"
        | "step"
        | "location"
        | "date"
        | "time"
        | boolean
        | undefined;
      "aria-describedby"?: string | undefined;
      "aria-description"?: string | undefined;
      "aria-details"?: string | undefined;
      "aria-disabled"?: "false" | "true" | boolean | undefined;
      "aria-dropeffect"?:
        | "none"
        | "copy"
        | "execute"
        | "link"
        | "move"
        | "popup"
        | undefined;
      "aria-errormessage"?: string | undefined;
      "aria-expanded"?: "false" | "true" | boolean | undefined;
      "aria-flowto"?: string | undefined;
      "aria-grabbed"?: "false" | "true" | boolean | undefined;
      "aria-haspopup"?:
        | "false"
        | "true"
        | "menu"
        | "listbox"
        | "tree"
        | "grid"
        | "dialog"
        | boolean
        | undefined;
      "aria-hidden"?: "false" | "true" | boolean | undefined;
      "aria-invalid"?:
        | "false"
        | "true"
        | "grammar"
        | "spelling"
        | boolean
        | undefined;
      "aria-keyshortcuts"?: string | undefined;
      "aria-label"?: string | undefined;
      "aria-labelledby"?: string | undefined;
      "aria-level"?: number | string | undefined;
      "aria-live"?: "off" | "assertive" | "polite" | undefined;
      "aria-modal"?: "false" | "true" | boolean | undefined;
      "aria-multiline"?: "false" | "true" | boolean | undefined;
      "aria-multiselectable"?: "false" | "true" | boolean | undefined;
      "aria-orientation"?: "horizontal" | "vertical" | undefined;
      "aria-owns"?: string | undefined;
      "aria-placeholder"?: string | undefined;
      "aria-posinset"?: number | string | undefined;
      "aria-pressed"?: "mixed" | "false" | "true" | boolean | undefined;
      "aria-readonly"?: "false" | "true" | boolean | undefined;
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
        | "text removals"
        | undefined;
      "aria-required"?: "false" | "true" | boolean | undefined;
      "aria-roledescription"?: string | undefined;
      "aria-rowcount"?: number | string | undefined;
      "aria-rowindex"?: number | string | undefined;
      "aria-rowindextext"?: string | undefined;
      "aria-rowspan"?: number | string | undefined;
      "aria-selected"?: "false" | "true" | boolean | undefined;
      "aria-setsize"?: number | string | undefined;
      "aria-sort"?: "none" | "ascending" | "descending" | "other" | undefined;
      "aria-valuemax"?: number | string | undefined;
      "aria-valuemin"?: number | string | undefined;
      "aria-valuenow"?: number | string | undefined;
      "aria-valuetext"?: string | undefined;
    }
    type HTMLAttributes =
      | GlobalAttributes
      | EventHandlerAttributes
      | AriaAttributes
      | { [key: string]: string | number | boolean | object | undefined };

    interface IntrinsicElements {
      // Allow unknown elements
      [key: string]: unknown;

      // HTML
      a:
        | {
            attributionsrc?: string | undefined;
            download?: boolean | string | undefined;
            href?: string | undefined;
            hreflang?: string | undefined;
            media?: string | undefined;
            ping?: string | undefined;
            referrerpolicy?:
              | "no-referrer"
              | "no-referrer-when-downgrade"
              | "origin"
              | "origin-when-cross-origin"
              | "same-origin"
              | "strict-origin"
              | "strict-origin-when-cross-origin"
              | "unsafe-url"
              | undefined;
            rel?:
              | "alternate"
              | "author"
              | "bookmark"
              | "canonical"
              | "dns-prefetch"
              | "external"
              | "help"
              | "icon"
              | "license"
              | "manifest"
              | "modulepreload"
              | "next"
              | "nofollow"
              | "noopener"
              | "noreferrer"
              | "opener"
              | "pingback"
              | "preconnect"
              | "prefetch"
              | "preload"
              | "prerender"
              | "prev"
              | "search"
              | "stylesheet"
              | "tag"
              | undefined;
            target?:
              | "_self"
              | "_blank"
              | "_parent"
              | "_top"
              | string
              | undefined;
            type?: string | undefined;
            /** @deprecated */
            charset?: string | undefined;
            /** @deprecated */
            coords?: string | undefined;
            /** @deprecated */
            name?: string | undefined;
            /** @deprecated */
            rev?: string | undefined;
            /** @deprecated */
            shape?: "default" | "rect" | "circle" | "poly" | undefined;
          }
        | HTMLAttributes;
      abbr: HTMLAttributes;
      /** @deprecated */
      acronym: HTMLAttributes;
      address: HTMLAttributes;
      area:
        | {
            alt?: string | undefined;
            coords?: string | undefined;
            download?: string | boolean | undefined;
            href?: string | undefined;
            hreflang?: string | undefined;
            media?: string | undefined;
            ping?: string | undefined;
            referrerpolicy?:
              | "no-referrer"
              | "no-referrer-when-downgrade"
              | "origin"
              | "origin-when-cross-origin"
              | "same-origin"
              | "strict-origin"
              | "strict-origin-when-cross-origin"
              | "unsafe-url"
              | undefined;
            rel?:
              | "alternate"
              | "author"
              | "bookmark"
              | "canonical"
              | "dns-prefetch"
              | "external"
              | "help"
              | "icon"
              | "license"
              | "manifest"
              | "modulepreload"
              | "next"
              | "nofollow"
              | "noopener"
              | "noreferrer"
              | "opener"
              | "pingback"
              | "preconnect"
              | "prefetch"
              | "preload"
              | "prerender"
              | "prev"
              | "search"
              | "stylesheet"
              | "tag"
              | undefined;
            shape?: "default" | "rect" | "circle" | "poly" | undefined;
            target?:
              | "_self"
              | "_blank"
              | "_parent"
              | "_top"
              | string
              | undefined;
            type?: string | undefined;
          }
        | HTMLAttributes;
      article: HTMLAttributes;
      aside: HTMLAttributes;
      audio:
        | {
            autoplay?: "" | "autoplay" | boolean | undefined;
            controls?: "" | "controls" | boolean | undefined;
            controlslist?: string | undefined;
            crossorigin?: "" | "anonymous" | "use-credentials" | undefined;
            disableremoteplayback?:
              | ""
              | "disableremoteplayback"
              | boolean
              | undefined;
            loop?: "" | "loop" | boolean | undefined;
            muted?: "" | "muted" | boolean | undefined;
            preload?: "" | "auto" | "none" | "metadata" | undefined;
            src?: string | undefined;
          }
        | HTMLAttributes;
      b: HTMLAttributes;
      base:
        | {
            href?: string | undefined;
            target?:
              | "_self"
              | "_blank"
              | "_parent"
              | "_top"
              | string
              | undefined;
          }
        | HTMLAttributes;
      bdi: HTMLAttributes;
      bdo:
        | {
            dir?: "ltr" | "rtl" | "auto" | undefined;
          }
        | HTMLAttributes;
      /** @deprecated */
      big: HTMLAttributes;
      blockquote:
        | {
            cite?: string | undefined;
          }
        | HTMLAttributes;
      body:
        | {
            /** @deprecated */
            alink?: string | undefined;
            /** @deprecated */
            background?: string | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            bottommargin?: number | string | undefined;
            /** @deprecated */
            leftmargin?: number | string | undefined;
            /** @deprecated */
            link?: string | undefined;
            onafterprint?: string | undefined;
            onbeforeprint?: string | undefined;
            onbeforeunload?: string | undefined;
            onblur?: string | undefined;
            onerror?: string | undefined;
            onfocus?: string | undefined;
            onhashchange?: string | undefined;
            onlanguagechange?: string | undefined;
            onload?: string | undefined;
            onmessage?: string | undefined;
            onoffline?: string | undefined;
            ononline?: string | undefined;
            onpopstate?: string | undefined;
            onresize?: string | undefined;
            onstorage?: string | undefined;
            onunload?: string | undefined;
            /** @deprecated */
            rightmargin?: number | string | undefined;
            /** @deprecated */
            text?: string | undefined;
            /** @deprecated */
            topmargin?: number | string | undefined;
            /** @deprecated */
            vlink?: string | undefined;
          }
        | HTMLAttributes;
      br:
        | {
            /** @deprecated */
            clear?: "none" | "left" | "right" | "both" | undefined;
          }
        | HTMLAttributes;
      button:
        | {
            disabled?: "" | "disabled" | boolean | undefined;
            form?: string | undefined;
            formaction?: string | undefined;
            formenctype?:
              | "application/x-www-form-urlencoded"
              | "multipart/form-data"
              | "text/plain"
              | undefined;
            formmethod?: "post" | "get" | "dialog" | undefined;
            formnovalidate?: "" | "formnovalidate" | boolean | undefined;
            formtarget?:
              | "_self"
              | "_blank"
              | "_parent"
              | "_top"
              | string
              | undefined;
            name?: string | undefined;
            popovertarget?: string | undefined;
            popovertargetaction?: "show" | "hide" | "toggle" | undefined;
            type?: "submit" | "reset" | "button" | undefined;
            value?: string | number | undefined;
          }
        | HTMLAttributes;
      canvas:
        | {
            height?: number | string | undefined;
            /** @deprecated */
            "moz-opaque"?: boolean | string | undefined;
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      caption:
        | {
            /** @deprecated */
            align?: "left" | "right" | "center" | "justify" | undefined;
          }
        | HTMLAttributes;
      /** @deprecated */
      center: HTMLAttributes;
      cite: HTMLAttributes;
      code: HTMLAttributes;
      col:
        | {
            span?: number | string | undefined;
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            char?: string | undefined;
            /** @deprecated */
            charoff?: string | undefined;
            /** @deprecated */
            valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
            /** @deprecated */
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      colgroup:
        | {
            span?: number | string | undefined;
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            char?: string | undefined;
            /** @deprecated */
            charoff?: string | undefined;
            /** @deprecated */
            valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
            /** @deprecated */
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      data:
        | {
            value?: string | number | undefined;
          }
        | HTMLAttributes;
      datalist: HTMLAttributes;
      dd: HTMLAttributes;
      del:
        | {
            cite?: string | undefined;
            datetime?: string | undefined;
          }
        | HTMLAttributes;
      details:
        | {
            open?: "" | "open" | boolean | undefined;
            name?: string | undefined;
          }
        | HTMLAttributes;
      dfn: HTMLAttributes;
      dialog:
        | {
            open?: "" | "open" | boolean | undefined;
          }
        | HTMLAttributes;
      /** @deprecated */
      dir:
        | {
            /** @deprecated */
            compact?: boolean | string | undefined;
          }
        | HTMLAttributes;
      div: HTMLAttributes;
      dl: HTMLAttributes;
      dt: HTMLAttributes;
      em: HTMLAttributes;
      embed:
        | {
            height?: number | string | undefined;
            src?: string | undefined;
            type?: string | undefined;
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      fencedframe:
        | {
            allow?: string | undefined;
            height?: number | string | undefined;
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      fieldset:
        | {
            disabled?: "" | "disabled" | boolean | undefined;
            form?: string | undefined;
            name?: string | undefined;
          }
        | HTMLAttributes;
      figcaption: HTMLAttributes;
      figure: HTMLAttributes;
      /** @deprecated */
      font:
        | {
            /** @deprecated */
            color?: string | undefined;
            /** @deprecated */
            face?: string | undefined;
            /** @deprecated */
            size?: number | string | undefined;
          }
        | HTMLAttributes;
      footer: HTMLAttributes;
      form:
        | {
            /** @deprecated */
            accept?: string | undefined;
            "accept-charset"?: string | undefined;
            action?: string | undefined;
            autocomplete?: "on" | "off" | string | undefined;
            enctype?:
              | "application/x-www-form-urlencoded"
              | "multipart/form-data"
              | "text/plain"
              | undefined;
            method?: "post" | "get" | "dialog" | undefined;
            name?: string | undefined;
            novalidate?: "" | "novalidate" | boolean | undefined;
            rel?:
              | "alternate"
              | "author"
              | "bookmark"
              | "canonical"
              | "dns-prefetch"
              | "external"
              | "help"
              | "icon"
              | "license"
              | "manifest"
              | "modulepreload"
              | "next"
              | "nofollow"
              | "noopener"
              | "noreferrer"
              | "opener"
              | "pingback"
              | "preconnect"
              | "prefetch"
              | "preload"
              | "prerender"
              | "prev"
              | "search"
              | "stylesheet"
              | "tag"
              | undefined;
            target?:
              | "_self"
              | "_blank"
              | "_parent"
              | "_top"
              | "_unfencedTop"
              | string
              | undefined;
          }
        | HTMLAttributes;
      /** @deprecated */
      frame:
        | {
            /** @deprecated */
            src?: string | undefined;
            /** @deprecated */
            name?: string | undefined;
            /** @deprecated */
            noresize?: "" | "noresize" | boolean | undefined;
            /** @deprecated */
            scrolling?: "yes" | "no" | "auto" | undefined;
            /** @deprecated */
            marginheight?: number | string | undefined;
            /** @deprecated */
            marginwidth?: number | string | undefined;
            /** @deprecated */
            frameborder?: number | string | undefined;
          }
        | HTMLAttributes;
      /** @deprecated */
      frameset:
        | {
            /** @deprecated */
            cols?: number | string | undefined;
            /** @deprecated */
            rows?: number | string | undefined;
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
            profile?: string | undefined;
          }
        | HTMLAttributes;
      header: HTMLAttributes;
      hgroup: HTMLAttributes;
      hr:
        | {
            /** @deprecated */
            align?: "left" | "center" | "right" | undefined;
            /** @deprecated */
            color?: string | undefined;
            /** @deprecated */
            noshade?: "" | "noshade" | boolean | undefined;
            /** @deprecated */
            size?: number | string | undefined;
            /** @deprecated */
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      html:
        | {
            /** @deprecated */
            version?: string | undefined;
            xmlns?: string | undefined;
          }
        | HTMLAttributes;
      i: HTMLAttributes;
      iframe:
        | {
            allow?: string | undefined;
            allowfullscreen?: "" | "allowfullscreen" | boolean | undefined;
            /** @deprecated */
            allowpaymentrequest?:
              | ""
              | "allowpaymentrequest"
              | boolean
              | undefined;
            browsingtopics?: "" | "browsingtopics" | boolean | undefined;
            credentialless?: "" | "credentialless" | boolean | undefined;
            csp?: string | undefined;
            height?: number | string | undefined;
            loading?: "eager" | "lazy" | undefined;
            name?: string | undefined;
            referrerpolicy?:
              | "no-referrer"
              | "no-referrer-when-downgrade"
              | "origin"
              | "origin-when-cross-origin"
              | "same-origin"
              | "strict-origin"
              | "strict-origin-when-cross-origin"
              | "unsafe-url"
              | undefined;
            sandbox?: string | undefined;
            src?: string | undefined;
            srcdoc?: string | undefined;
            width?: number | string | undefined;
            /** @deprecated */
            align?: "left" | "center" | "right" | undefined;
            /** @deprecated */
            frameborder?: number | string | undefined;
            /** @deprecated */
            longdesc?: string | undefined;
            /** @deprecated */
            marginheight?: number | string | undefined;
            /** @deprecated */
            marginwidth?: number | string | undefined;
            /** @deprecated */
            scrolling?: "yes" | "no" | "auto" | undefined;
          }
        | HTMLAttributes;
      img:
        | {
            alt?: string | undefined;
            attributionsrc?: string | undefined;
            crossorigin?: "" | "anonymous" | "use-credentials" | undefined;
            decoding?: "sync" | "async" | "auto" | undefined;
            elementtiming?: string | undefined;
            fetchpriority?: "high" | "low" | "auto" | undefined;
            height?: number | string | undefined;
            intrinsicsize?: string | undefined;
            ismap?: "" | "ismap" | boolean | undefined;
            loading?: "eager" | "lazy" | undefined;
            referrerpolicy?:
              | "no-referrer"
              | "no-referrer-when-downgrade"
              | "origin"
              | "origin-when-cross-origin"
              | "same-origin"
              | "strict-origin"
              | "strict-origin-when-cross-origin"
              | "unsafe-url"
              | undefined;
            sizes?: string | undefined;
            src?: string | undefined;
            srcset?: string | undefined;
            width?: number | string | undefined;
            usemap?: string | undefined;
            /** @deprecated */
            align?: "left" | "center" | "right" | "bottom" | "top" | undefined;
            /** @deprecated */
            border?: string | number | undefined;
            /** @deprecated */
            hspace?: number | string | undefined;
            /** @deprecated */
            longdesc?: string | undefined;
            /** @deprecated */
            name?: string | undefined;
            /** @deprecated */
            vspace?: number | string | undefined;
          }
        | HTMLAttributes;
      input:
        | {
            accept?: string | undefined;
            alt?: string | undefined;
            autocomplete?: "on" | "off" | string | undefined;
            autocorrect?: "on" | "off" | undefined;
            capture?: boolean | "user" | "environment" | undefined;
            checked?: "" | "checked" | boolean | undefined;
            dirname?: string | undefined;
            disabled?: "" | "disabled" | boolean | undefined;
            form?: string | undefined;
            formaction?: string | undefined;
            formenctype?:
              | "application/x-www-form-urlencoded"
              | "multipart/form-data"
              | "text/plain"
              | undefined;
            formmethod?: "post" | "get" | "dialog" | undefined;
            formnovalidate?: "" | "formnovalidate" | boolean | undefined;
            formtarget?:
              | "_self"
              | "_blank"
              | "_parent"
              | "_top"
              | string
              | undefined;
            height?: number | string | undefined;
            incremental?: boolean | string | undefined;
            id?: string | undefined;
            inputmode?:
              | "none"
              | "text"
              | "tel"
              | "url"
              | "email"
              | "numeric"
              | "decimal"
              | "search"
              | undefined;
            list?: string | undefined;
            max?: number | string | undefined;
            maxlength?: number | string | undefined;
            min?: number | string | undefined;
            minlength?: number | string | undefined;
            multiple?: "" | "multiple" | boolean | undefined;
            name?: string | undefined;
            orient?: "horizontal" | "vertical" | undefined;
            pattern?: string | undefined;
            placeholder?: string | undefined;
            popovertarget?: string | undefined;
            popovertargetaction?: "show" | "hide" | "toggle" | undefined;
            readonly?: "" | "readonly" | boolean | undefined;
            results?: number | string | undefined;
            required?: "" | "required" | boolean | undefined;
            size?: number | string | undefined;
            src?: string | undefined;
            step?: number | string | undefined;
            tabindex?: number | string | undefined;
            title?: string | undefined;
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
              | "week"
              | undefined;
            value?: string | number | undefined;
            webkitdirectory?: "" | "webkitdirectory" | boolean | undefined;
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      ins:
        | {
            cite?: string | undefined;
            datetime?: string | undefined;
          }
        | HTMLAttributes;
      kbd: HTMLAttributes;
      label:
        | {
            for?: string | undefined;
          }
        | HTMLAttributes;
      legend: HTMLAttributes;
      li:
        | {
            value?: string | number | undefined;
            /** @deprecated */
            type?: string | undefined;
          }
        | HTMLAttributes;
      link:
        | {
            as?: string | undefined;
            blocking?: "render" | "script" | "style" | undefined;
            crossorigin?: "anonymous" | "use-credentials" | "" | undefined;
            disabled?: "" | "disabled" | boolean | undefined;
            fetchpriority?: "high" | "low" | "auto" | undefined;
            href?: string | undefined;
            hreflang?: string | undefined;
            imagesizes?: string | undefined;
            imagesrcset?: string | undefined;
            integrity?: string | undefined;
            media?: string | undefined;
            referrerpolicy?:
              | "no-referrer"
              | "no-referrer-when-downgrade"
              | "origin"
              | "origin-when-cross-origin"
              | "same-origin"
              | "strict-origin"
              | "strict-origin-when-cross-origin"
              | "unsafe-url"
              | undefined;
            rel?:
              | "alternate"
              | "author"
              | "bookmark"
              | "canonical"
              | "dns-prefetch"
              | "external"
              | "help"
              | "icon"
              | "license"
              | "manifest"
              | "modulepreload"
              | "next"
              | "nofollow"
              | "noopener"
              | "noreferrer"
              | "opener"
              | "pingback"
              | "preconnect"
              | "prefetch"
              | "preload"
              | "prerender"
              | "prev"
              | "search"
              | "stylesheet"
              | "tag"
              | undefined;
            sizes?: string | undefined;
            title?: string | undefined;
            type?: string | undefined;
          }
        | HTMLAttributes;
      main: HTMLAttributes;
      map:
        | {
            name?: string | undefined;
          }
        | HTMLAttributes;
      mark: HTMLAttributes;
      /** @deprecated */
      marquee:
        | {
            /** @deprecated */
            behavior?: "scroll" | "slide" | "alternate" | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            direction?: "left" | "right" | "up" | "down" | undefined;
            /** @deprecated */
            height?: number | string | undefined;
            /** @deprecated */
            hspace?: number | string | undefined;
            /** @deprecated */
            loop?: number | string | undefined;
            /** @deprecated */
            scrollamount?: number | string | undefined;
            /** @deprecated */
            scrolldelay?: number | string | undefined;
            /** @deprecated */
            truespeed?: boolean | string | undefined;
            /** @deprecated */
            vspace?: number | string | undefined;
            /** @deprecated */
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      menu: HTMLAttributes;
      meta:
        | {
            charset?: string | undefined;
            content?: string | undefined;
            "http-equiv"?:
              | "content-security-policy"
              | "content-type"
              | "default-style"
              | "x-ua-compatible"
              | "refresh"
              | undefined;
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
              | undefined;
          }
        | HTMLAttributes;
      meter:
        | {
            value?: number | string | undefined;
            min?: number | string | undefined;
            max?: number | string | undefined;
            low?: number | string | undefined;
            high?: number | string | undefined;
            optimum?: number | string | undefined;
            form?: string | undefined;
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
            archive?: string | undefined;
            /** @deprecated */
            border?: string | number | undefined;
            /** @deprecated */
            classid?: string | undefined;
            /** @deprecated */
            codebase?: string | undefined;
            /** @deprecated */
            codetype?: string | undefined;
            data?: string | undefined;
            /** @deprecated */
            declare?: "" | "declare" | boolean | undefined;
            form?: string | undefined;
            height?: number | string | undefined;
            name?: string | undefined;
            /** @deprecated */
            standby?: string | undefined;
            type?: string | undefined;
            /** @deprecated */
            usemap?: string | undefined;
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      ol:
        | {
            reversed?: "" | "reversed" | boolean | undefined;
            start?: number | string | undefined;
            type?: "1" | "a" | "A" | "i" | "I" | undefined;
          }
        | HTMLAttributes;
      optgroup:
        | {
            disabled?: "" | "disabled" | boolean | undefined;
            label?: string | undefined;
          }
        | HTMLAttributes;
      option:
        | {
            disabled?: "" | "disabled" | boolean | undefined;
            label?: string | undefined;
            selected?: "" | "selected" | boolean | undefined;
            value?: string | number | undefined;
          }
        | HTMLAttributes;
      output:
        | {
            for?: string | undefined;
            form?: string | undefined;
            name?: string | undefined;
          }
        | HTMLAttributes;
      p: HTMLAttributes;
      /** @deprecated */
      param:
        | {
            /** @deprecated */
            name?: string | undefined;
            /** @deprecated */
            value?: string | undefined;
            /** @deprecated */
            type?: string | undefined;
            /** @deprecated */
            valuetype?: "data" | "ref" | "object" | undefined;
          }
        | HTMLAttributes;
      picture: HTMLAttributes;
      /** @deprecated */
      plaintext: HTMLAttributes;
      portal:
        | {
            referrerpolicy?:
              | "no-referrer"
              | "no-referrer-when-downgrade"
              | "origin"
              | "origin-when-cross-origin"
              | "same-origin"
              | "strict-origin"
              | "strict-origin-when-cross-origin"
              | "unsafe-url"
              | undefined;
            src?: string | undefined;
          }
        | HTMLAttributes;
      pre:
        | {
            /** @deprecated */
            width?: number | string | undefined;
            /** @deprecated */
            wrap?: "hard" | "soft" | "off" | undefined;
          }
        | HTMLAttributes;
      progress:
        | {
            max?: number | string | undefined;
            value?: string | number | undefined;
          }
        | HTMLAttributes;
      q:
        | {
            cite?: string | undefined;
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
            async?: "" | "async" | boolean | undefined;
            attributionsrc?: string | undefined;
            blocking?: "render" | "script" | "style" | undefined;
            crossorigin?: "anonymous" | "use-credentials" | "" | undefined;
            defer?: "" | "defer" | boolean | undefined;
            fetchpriority?: "high" | "low" | "auto" | undefined;
            integrity?: string | undefined;
            nomodule?: "" | "nomodule" | boolean | undefined;
            nonce?: string | undefined;
            referrerpolicy?:
              | "no-referrer"
              | "no-referrer-when-downgrade"
              | "origin"
              | "origin-when-cross-origin"
              | "same-origin"
              | "strict-origin"
              | "strict-origin-when-cross-origin"
              | "unsafe-url"
              | undefined;
            src?: string | undefined;
            type?: string | undefined;
            /** @deprecated */
            charset?: string | undefined;
            /** @deprecated */
            language?: string | undefined;
          }
        | HTMLAttributes;
      search: HTMLAttributes;
      section: HTMLAttributes;
      select:
        | {
            autocomplete?: "on" | "off" | string | undefined;
            disabled?: "" | "disabled" | boolean | undefined;
            form?: string | undefined;
            multiple?: "" | "multiple" | boolean | undefined;
            name?: string | undefined;
            required?: "" | "required" | boolean | undefined;
            size?: number | string | undefined;
          }
        | HTMLAttributes;
      slot:
        | {
            name?: string | undefined;
          }
        | HTMLAttributes;
      small: HTMLAttributes;
      source:
        | {
            type?: string | undefined;
            src?: string | undefined;
            srcset?: string | undefined;
            sizes?: string | undefined;
            media?: string | undefined;
            height?: number | string | undefined;
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      span: HTMLAttributes;
      /** @deprecated */
      strike: HTMLAttributes;
      strong: HTMLAttributes;
      style:
        | {
            blocking?: "render" | "script" | "style" | undefined;
            media?: string | undefined;
            nonce?: string | undefined;
            title?: string | undefined;
            /** @deprecated */
            type?: string | undefined;
          }
        | HTMLAttributes;
      sub: HTMLAttributes;
      summary: HTMLAttributes;
      sup: HTMLAttributes;
      table:
        | {
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            border?: string | number | undefined;
            /** @deprecated */
            cellpadding?: string | number | undefined;
            /** @deprecated */
            cellspacing?: string | number | undefined;
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
              | "border"
              | undefined;
            /** @deprecated */
            rules?: "none" | "groups" | "rows" | "cols" | "all" | undefined;
            /** @deprecated */
            summary?: string | undefined;
            /** @deprecated */
            width?: string | number | undefined;
          }
        | HTMLAttributes;
      tbody:
        | {
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            char?: string | undefined;
            /** @deprecated */
            charoff?: string | undefined;
            /** @deprecated */
            valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
          }
        | HTMLAttributes;
      td:
        | {
            colspan?: number | string | undefined;
            headers?: string | undefined;
            rowspan?: number | string | undefined;
            /** @deprecated */
            abbr?: string | undefined;
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            axis?: string | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            char?: string | undefined;
            /** @deprecated */
            charoff?: string | undefined;
            /** @deprecated */
            height?: number | string | undefined;
            /** @deprecated */
            scope?: string | undefined;
            /** @deprecated */
            valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
            /** @deprecated */
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      template:
        | {
            shadowrootmode?: "open" | "closed" | undefined;
            shadowrootclonable?:
              | ""
              | "shadowrootclonable"
              | boolean
              | undefined;
            shadowrootdelegatesfocus?:
              | ""
              | "shadowrootdelegatesfocus"
              | boolean
              | undefined;
            shadowrootserializable?:
              | ""
              | "shadowrootserializable"
              | boolean
              | undefined;
          }
        | HTMLAttributes;
      textarea:
        | {
            autocomplete?: "on" | "off" | string | undefined;
            autocorrect?: "on" | "off" | undefined;
            cols?: number | string | undefined;
            dirname?: string | undefined;
            disabled?: "" | "disabled" | boolean | undefined;
            form?: string | undefined;
            maxlength?: number | string | undefined;
            minlength?: number | string | undefined;
            name?: string | undefined;
            placeholder?: string | undefined;
            readonly?: "" | "readonly" | boolean | undefined;
            required?: "" | "required" | boolean | undefined;
            rows?: number | string | undefined;
            wrap?: "hard" | "soft" | "off" | undefined;
          }
        | HTMLAttributes;
      tfoot:
        | {
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            char?: string | undefined;
            /** @deprecated */
            charoff?: string | undefined;
            /** @deprecated */
            valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
          }
        | HTMLAttributes;
      th:
        | {
            abbr?: string | undefined;
            colspan?: number | string | undefined;
            headers?: string | undefined;
            rowspan?: number | string | undefined;
            scope?: string | undefined;
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            axis?: string | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            char?: string | undefined;
            /** @deprecated */
            charoff?: string | undefined;
            /** @deprecated */
            height?: number | string | undefined;
            /** @deprecated */
            valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
            /** @deprecated */
            width?: number | string | undefined;
          }
        | HTMLAttributes;
      thead:
        | {
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            char?: string | undefined;
            /** @deprecated */
            charoff?: string | undefined;
            /** @deprecated */
            valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
          }
        | HTMLAttributes;
      time:
        | {
            datetime?: string | undefined;
          }
        | HTMLAttributes;
      title: HTMLAttributes;
      tr:
        | {
            /** @deprecated */
            align?: "left" | "center" | "right" | "justify" | undefined;
            /** @deprecated */
            bgcolor?: string | undefined;
            /** @deprecated */
            char?: string | undefined;
            /** @deprecated */
            charoff?: string | undefined;
            /** @deprecated */
            valign?: "top" | "middle" | "bottom" | "baseline" | undefined;
          }
        | HTMLAttributes;
      track:
        | {
            default?: "" | "default" | boolean | undefined;
            kind?: string | undefined;
            label?: string | undefined;
            src?: string | undefined;
            srclang?: string | undefined;
          }
        | HTMLAttributes;
      /** @deprecated */
      tt: HTMLAttributes;
      u: HTMLAttributes;
      ul:
        | {
            /** @deprecated */
            compact?: boolean | string | undefined;
            /** @deprecated */
            type?: string | undefined;
          }
        | HTMLAttributes;
      var: HTMLAttributes;
      video:
        | {
            autoplay?: "" | "autoplay" | boolean | undefined;
            controls?: "" | "controls" | boolean | undefined;
            controlslist?: string | undefined;
            crossorigin?: "" | "anonymous" | "use-credentials" | undefined;
            disablepictureinpicture?:
              | ""
              | "disablepictureinpicture"
              | boolean
              | undefined;
            disableremoteplayback?:
              | ""
              | "disableremoteplayback"
              | boolean
              | undefined;
            height?: number | string | undefined;
            loop?: "" | "loop" | boolean | undefined;
            muted?: "" | "muted" | boolean | undefined;
            playsinline?: "" | "playsinline" | boolean | undefined;
            poster?: string | undefined;
            preload?: "" | "none" | "metadata" | "auto" | undefined;
            src?: string | undefined;
            width?: number | string | undefined;
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
