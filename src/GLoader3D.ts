/// <reference path="./GObject.ts" />
/// <reference path="./utils/GObjectRecycler.ts" />

namespace fgui {

    export class GLoader3D extends GObject implements IAnimationGear, IColorGear {

        protected $url: string;
        protected $align: AlignType;
        protected $verticalAlign: VertAlignType;
        protected $autoSize: boolean;
        protected $fill: LoaderFillType;
        protected $showErrorSign: boolean;
        protected $playing: boolean;
        protected $frame: number = 0;
        protected $color: number = 0;

        private $contentItem: PackageItem;
        private $contentSourceWidth: number = 0;
        private $contentSourceHeight: number = 0;
        private $contentWidth: number = 0;
        private $contentHeight: number = 0;

        protected $container: UIContainer;
        protected $content: PIXI.spine38.Spine;
        protected $errorSign: GObject;
        private _loop: boolean;
        private _animationName: string;
        private _skinName: string;

        private $updatingLayout: boolean;

        private static $errorSignPool: utils.GObjectRecycler = new utils.GObjectRecycler();
        public constructor() {
            super();
            this.$playing = true;
            this.$url = "";
            this.$fill = LoaderFillType.None;
            this.$align = AlignType.Left;
            this.$verticalAlign = VertAlignType.Top;
            this.$showErrorSign = true;
            this.$color = 0xFFFFFF;
        }

        protected createDisplayObject(): void {
            this.$container = new UIContainer(this);
            this.$container.hitArea = new PIXI.Rectangle();
            this.setDisplayObject(this.$container);
            this.$container.interactiveChildren = false;
        }

        public dispose(): void {
            this.clearContent();
            super.dispose();
        }

        public get url(): string {
            return this.$url;
        }

        public set url(value: string) {
            if (this.$url == value)
                return;

            this.$url = value;
            this.loadContent();
            this.updateGear(GearType.Icon);
        }

        public get icon(): string {
            return this.$url;
        }

        public set icon(value: string) {
            this.url = value;
        }

        public get align(): AlignType {
            return this.$align;
        }

        public set align(value: AlignType) {
            if (this.$align != value) {
                this.$align = value;
                this.updateLayout();
            }
        }

        public get verticalAlign(): VertAlignType {
            return this.$verticalAlign;
        }

        public set verticalAlign(value: VertAlignType) {
            if (this.$verticalAlign != value) {
                this.$verticalAlign = value;
                this.updateLayout();
            }
        }

        public get fill(): LoaderFillType {
            return this.$fill;
        }

        public set fill(value: LoaderFillType) {
            if (this.$fill != value) {
                this.$fill = value;
                this.updateLayout();
            }
        }

        public get autoSize(): boolean {
            return this.$autoSize;
        }

        public set autoSize(value: boolean) {
            if (this.$autoSize != value) {
                this.$autoSize = value;
                this.updateLayout();
            }
        }

        public get playing(): boolean {
            return this.$playing;
        }

        public set playing(value: boolean) {
            if (this.$playing != value) {
                this.$playing = value;
                this.updateGear(GearType.Animation);
            }
        }

        public get frame(): number {
            return this.$frame;
        }

        public set frame(value: number) {
            if (this.$frame != value) {
                this.$frame = value;
                this.updateGear(GearType.Animation);
            }
        }

        public get color(): number {
            return this.$color;
        }

        public set color(value: number) {
            if (this.$color != value) {
                this.$color = value;
                this.updateGear(GearType.Color);
                this.applyColor();
            }
        }

        public get animationName(): string {
            return this._animationName;
        }

        public set animationName(value: string) {
            if (this._animationName != value) {
                // 默认每次都重置回1
                this._playbackRate = 1;
                this._animationName = value;
                this.onChange();
            }
        }

        public get skinName(): string {
            return this._skinName;
        }

        public set skinName(value: string) {
            if (this._skinName != value) {
                this._skinName = value;
                this.onChange();
            }
        }

        public get loop(): boolean {
            return this._loop;
        }

        public set loop(value: boolean) {
            if (this._loop != value) {
                this._loop = value;
                this.onChange();
            }
        }

        private _playbackRate:number = 1;
        public get playbackRate(){
            return this._playbackRate;
        }
        public set playbackRate(v:number){
            if(this._playbackRate === v){
                return;
            }
            this._playbackRate = v;
            this.onChange();
        }

        private _animationDuration:{[name:string]:number};
        public setAnimationDuration(name:string,duration:number){
            if(!this._animationDuration){
                this._animationDuration = {};
            }
            if(this._animationDuration[name] === duration){
                return;
            }
            if(!duration){
                delete this._animationDuration[name];
            }
            else{
                this._animationDuration[name] = duration;
            }
            
            this.onChange();
        }

        private _defaultMix:number = 0;
        public setDefaultMix(v:number){
            if(this._defaultMix === v){
                return;
            }
            this._defaultMix = v;
            this.onChange();
        }

        private onChange(){
            if (!this.$content)
                return;

            if(this._playbackRate !== undefined){
                // TODO 实现playbackRate
                // this.$content.playbackRate(this._playbackRate);
            }
            if(this._defaultMix !== undefined){
                // @ts-ignore
                this.$content.stateData.defaultMix = this._defaultMix;
            }
            if(this._animationName && this._animationDuration && this._animationDuration[this._animationName]){
                // 获得动画时间，并计算playbackRate值
                 // @ts-ignore TODO 实现playbackRate
                // const anims = this.$content.skeleton.data.animations;
                // const anim = anims.find(anim=>anim.name === this._animationName);
                // if(anim && anim.duration){
                //     this.$content.playbackRate(anim.duration/this._animationDuration[this._animationName]);
                // }
            }

            if (this._animationName) {
                if (this.$playing)
                    this.$content.state.addAnimation(0,this._animationName, this._loop,0);
                else
                    this.$content.state.addAnimation(0,this._animationName, false, 0);
            }
            else
                this.$content.state.addEmptyAnimation(0,0,0);

            
            if (this._skinName)
                this.$content.skeleton.setSkinByName(this._skinName);
            else
                this.$content.skeleton.setSkinByName("default");
        }

        private applyColor(): void {
            if (this.$content)
                this.$content.tint = this.$color;
        }

        public get showErrorSign(): boolean {
            return this.$showErrorSign;
        }

        public set showErrorSign(value: boolean) {
            this.$showErrorSign = value;
        }

        public get content(): PIXI.spine38.Spine {
            return this.$content;
        }

        public get texture(): PIXI.Texture {
            if (this.$content instanceof UIImage)
                return this.$content.texture;
            else
                return null;
        }

        public set texture(value: PIXI.Texture) {
            this.url = null;
            this.switchToMovieMode(false);

            if(this.$content instanceof UIImage)
                this.$content.texture = value;

            if (value) {
                this.$contentSourceWidth = value.orig.width;
                this.$contentSourceHeight = value.orig.height;
            }
            else
                this.$contentSourceWidth = this.$contentHeight = 0;

            this.updateLayout();
        }

        protected loadContent(): void {
            this.clearContent();

            if (!this.$url)
                return;

            if (utils.StringUtil.startsWith(this.$url, "ui://"))
                this.loadFromPackage(this.$url);
            else
                this.loadExternal();
        }
        
        protected loadFromPackage(itemURL: string): void {
            this.$contentItem = UIPackage.getItemByURL(itemURL);
            if (this.$contentItem) {
                this.$contentItem.load();

                if (this.$contentItem.type == PackageItemType.Image) {
                    
                }
                else if (this.$contentItem.type == PackageItemType.MovieClip) {
                   
                }
                else if (this.$contentItem.type == PackageItemType.Misc) {
                    const jsonUrl = this.$contentItem.owner.getSubRes(this.$contentItem.file);
                    // const atlasUrl = jsonUrl.replace(".json",".atlas");
                    // const texUrl = jsonUrl.replace(".json",".png");
                    PIXI.loader.add(jsonUrl, jsonUrl).load( (loader, resources)=> {
                        this.$content = new PIXI.spine38.Spine(resources[jsonUrl].spineData);
                        this.$container.addChild(this.$content);
                        this.$content.x = this.$contentItem.anchor.x;
                        this.$content.y = this.$contentItem.anchor.y;
                        this.onChange();
                    });
                    
                }
                else
                    this.setErrorState();
            }
            else
                this.setErrorState();
        }

        private switchToMovieMode(value: boolean): void {
            this.$container.removeChildren();
            this.$container.addChild(this.$content);
        }

        private $loadingTexture:PIXI.Texture = null;

        /**overwrite this method if you need to load resources by your own way*/
        protected loadExternal(): void {
            let texture = PIXI.Texture.fromImage(this.$url, true);
            this.$loadingTexture = texture;
            //TODO: Texture does not have error event... monitor error event on baseTexture will casue cross-error-event problem.
            texture.once("update", () => {
                if (!texture.width || !texture.height)
                    this.$loadResCompleted(null);
                else
                    this.$loadResCompleted(texture);
            });
        }

        /**free the resource you loaded */
        protected freeExternal(texture: PIXI.Texture): void {
            PIXI.Texture.removeFromCache(texture);
            texture.destroy(texture.baseTexture != null);
        }

        private $loadResCompleted(res: PIXI.Texture): void {
            if (res)
                this.onExternalLoadSuccess(res);
            else {
                this.onExternalLoadFailed();
                this.$loadingTexture.removeAllListeners();
                this.freeExternal(this.$loadingTexture);
                this.$loadingTexture = null;
            }
            this.$loadingTexture = null;
        }
        
        /**content loaded */
        protected onExternalLoadSuccess(texture: PIXI.Texture): void {
            this.$container.removeChildren();
            
         this.$container.addChild(this.$content);
            //baseTexture loaded, so update frame info
            texture.frame = new PIXI.Rectangle(0, 0, texture.baseTexture.width, texture.baseTexture.height);
        
            this.$contentSourceWidth = texture.width;
            this.$contentSourceHeight = texture.height;
            this.updateLayout();
        }

        protected onExternalLoadFailed(): void {
            this.setErrorState();
        }

        private setErrorState(): void {
            if (!this.$showErrorSign)
                return;

            if (this.$errorSign == null) {
                if (UIConfig.loaderErrorSign) {
                    this.$errorSign = GLoader3D.$errorSignPool.get(UIConfig.loaderErrorSign);
                }
            }

            if (this.$errorSign) {
                this.$errorSign.width = this.width;
                this.$errorSign.height = this.height;
                this.$container.addChild(this.$errorSign.displayObject);
            }
        }

        private clearErrorState(): void {
            if (this.$errorSign) {
                this.$container.removeChild(this.$errorSign.displayObject);
                GLoader3D.$errorSignPool.recycle(this.$errorSign.resourceURL, this.$errorSign);
                this.$errorSign = null;
            }
        }

        private updateLayout(): void {
            if (this.$content == null) {
                if (this.$autoSize) {
                    this.$updatingLayout = true;
                    this.setSize(50, 30);
                    this.$updatingLayout = false;
                }
                return;
            }

            this.$content.position.set(0, 0);
            this.$content.scale.set(1, 1);
            this.$contentWidth = this.$contentSourceWidth;
            this.$contentHeight = this.$contentSourceHeight;

            if (this.$autoSize) {
                this.$updatingLayout = true;
                if (this.$contentWidth == 0)
                    this.$contentWidth = 50;
                if (this.$contentHeight == 0)
                    this.$contentHeight = 30;
                this.setSize(this.$contentWidth, this.$contentHeight);
                this.$updatingLayout = false;
            }
            else {
                let sx: number = 1, sy: number = 1;
                if (this.$fill != LoaderFillType.None) {
                    sx = this.width / this.$contentSourceWidth;
                    sy = this.height / this.$contentSourceHeight;

                    if (sx != 1 || sy != 1) {
                        if (this.$fill == LoaderFillType.ScaleMatchHeight)
                            sx = sy;
                        else if (this.$fill == LoaderFillType.ScaleMatchWidth)
                            sy = sx;
                        else if (this.$fill == LoaderFillType.Scale) {
                            if (sx > sy)
                                sx = sy;
                            else
                                sy = sx;
                        }
                        else if (this.$fill == LoaderFillType.ScaleNoBorder) {
                            if (sx > sy)
                                sy = sx;
                            else
                                sx = sy;
                        }
                        this.$contentWidth = this.$contentSourceWidth * sx;
                        this.$contentHeight = this.$contentSourceHeight * sy;
                    }
                }

                if (this.$content instanceof UIImage) {
                    this.$content.width = this.$contentWidth;
                    this.$content.height = this.$contentHeight;
                }
                else
                    this.$content.scale.set(sx, sy);

                if (this.$align == AlignType.Center)
                    this.$content.x = Math.floor((this.width - this.$contentWidth) / 2);
                else if (this.$align == AlignType.Right)
                    this.$content.x = this.width - this.$contentWidth;
                if (this.$verticalAlign == VertAlignType.Middle)
                    this.$content.y = Math.floor((this.height - this.$contentHeight) / 2);
                else if (this.$verticalAlign == VertAlignType.Bottom)
                    this.$content.y = this.height - this.$contentHeight;
            }
        }

        private clearContent(): void {
            this.clearErrorState();

            if (this.$content && this.$content.parent)
                this.$container.removeChild(this.$content);

            if(this.$loadingTexture) {
                this.$loadingTexture.removeAllListeners();
                this.freeExternal(this.$loadingTexture);
                this.$loadingTexture = null;
            }

            if (this.$contentItem == null && this.$content instanceof UIImage)
               this.freeExternal(this.$content.texture);
            
            this.$content && this.$content.destroy();
            this.$content = null;
            
            this.$contentItem = null;
        }

        protected handleSizeChanged(): void {
            if (!this.$updatingLayout)
                this.updateLayout();

            let rect: PIXI.Rectangle = this.$container.hitArea as PIXI.Rectangle;  //TODO: hitArea can be Rectangle | Circle | Ellipse | Polygon | RoundedRectangle
            rect.x = rect.y = 0;
            rect.width = this.width;
            rect.height = this.height;
        }

        public setupBeforeAdd(xml: utils.XmlNode): void {
            super.setupBeforeAdd(xml);

            let str: string;
            str = xml.attributes.url;
            if (str)
                this.$url = str;

            str = xml.attributes.align;
            if (str)
                this.$align = ParseAlignType(str);

            str = xml.attributes.vAlign;
            if (str)
                this.$verticalAlign = ParseVertAlignType(str);

            str = xml.attributes.fill;
            if (str)
                this.$fill = ParseLoaderFillType(str);

            this.$autoSize = xml.attributes.autoSize == "true";

            str = xml.attributes.errorSign;
            if (str)
                this.$showErrorSign = str == "true";

            this.$playing = xml.attributes.playing != "false";

            console.log("xml.attributes",xml.attributes);
            if(xml.attributes.skin){
                this._skinName = xml.attributes.skin;
            }
            if(xml.attributes.loop){
                this._loop = String(xml.attributes.loop) === "true";
            }
            if(xml.attributes.animation){
                this._animationName = xml.attributes.animation;
            }

            str = xml.attributes.color;
            if (str)
                this.color = utils.StringUtil.convertFromHtmlColor(str);

            if (this.$url)
                this.loadContent();
        }
    }
}