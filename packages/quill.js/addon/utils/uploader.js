// Override Quill's built-in Uploader module with a
// no-op. The built-in Uploader reads dropped/pasted
// files as base64 and embeds them inline. Our custom
// Import module handles file uploads instead, routing
// them through the Insert module and any configured
// upload handler.

export default class Uploader {
	constructor() {}
}
