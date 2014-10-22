interface IFlashVars {

}

declare module "awayjs-stagegl/lib/swfobject" {
	function embedSWF(swfUrl: string, id: string, width: string, height: string, version: string, expressInstallSwfurl: string, flashvars: IFlashVars, params: any, attributes: any, callback: any);
	function removeSWF(id:string);
}