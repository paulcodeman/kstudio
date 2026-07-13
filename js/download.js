function base64_encode(data) {
	try {
		return btoa(data);
	} catch (e) {
		const b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		let enc = '';
		for (let i = 0; i < data.length;) {
			const o1 = data.charCodeAt(i++);
			const o2 = data.charCodeAt(i++);
			const o3 = data.charCodeAt(i++);
			const bits = o1 << 16 | o2 << 8 | o3;
			enc += b64.charAt(bits >> 18 & 0x3f) + b64.charAt(bits >> 12 & 0x3f) + b64.charAt(bits >> 6 & 0x3f) + b64.charAt(bits & 0x3f);
		}
		switch (data.length % 3) {
			case 1: enc = enc.slice(0, -2) + '=='; break;
			case 2: enc = enc.slice(0, -1) + '='; break;
		}
		return enc;
	}
}

function downloadfile(data, obj) {
	const blob = new Blob([data], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	obj.href = url;
	obj.download = 'project.kcm';
}
