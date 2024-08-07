import type { APIContext, InferGetStaticPropsType } from "astro";

import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site-config";
import { getFormattedDate } from "@/utils";
import { Resvg } from "@resvg/resvg-js";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

const ogOptions: SatoriOptions = {
	// debug: true,
	fonts: [
		{
			data: Buffer.from(RobotoMono),
			name: "Roboto Mono",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.from(RobotoMonoBold),
			name: "Roboto Mono",
			style: "normal",
			weight: 700,
		},
	],
	height: 630,
	width: 1200,
};

const markup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
		<div tw="flex flex-col flex-1 w-full p-10 justify-center">
			<p tw="text-2xl mb-6">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full p-10 border-t border-[#8949a8] text-xl">
			<div tw="flex items-center">
				<svg viewBox="211.0556 116.1481 64 64" xmlns="http://www.w3.org/2000/svg">
					<g transform="matrix(1, 0, 0, 1, 211.0555572509766, 116.1481399536133)">
						<path
							fill="#2d2537"
							d="M 6.7243495,0 H 57.275651 C 61.00094,0 64,2.9990599 64,6.7243495 V 57.275651 C 64,61.00094 61.00094,64 57.275651,64 H 6.7243495 C 2.9990599,64 0,61.00094 0,57.275651 V 6.7243495 C 0,2.9990599 2.9990599,0 6.7243495,0 Z"
						></path>
						<path
							fill="#8949a8"
							d="M 104.33274,96.558695 92.46873,89.534627 82.243823,103.13819 76.421149,99.492792 v 11.736418 l 8.543974,4.50848 11.23792,-17.134015 z m 8.01277,3.46e-4 11.86462,-7.023042 10.22373,13.604451 5.82299,-3.644898 -0.001,11.736418 -8.54437,4.50774 -11.23644,-17.134986 z"
							transform="matrix(0.99843644,0,0,1.0545935,-76.169606,-89.240998)"
						></path>
						<path
							fill="#8949a8"
							d="m 35.850996,50.572905 -9.783394,-9.80779 -11.316681,14.33446 -8.3683207,-6.1613 v 12.32261 l 9.3113777,4.362741 11.392254,-14.547761 z m 3.946756,0 9.783394,-9.80779 11.316681,14.33446 8.368321,-6.1613 v 12.32261 L 59.95477,65.623626 48.562516,51.075865 Z"
							transform="matrix(1.01349,0,0,0.99846926,-6.3346255,-12.507173)"
						></path>
						<path fill="#8949a8" d="M 10,63.825611 32,48 54,63.825611 Z"></path>
						<path fill="#2d2537" d="M 24.397333,62.92247 32,57.453523 39.602667,62.92247 Z"></path>
						<path
							fill="none"
							stroke="#2d2537"
							stroke-width="1.2"
							d="M 7.1977966,0.59940314 H 56.802203 c 3.65551,0 6.598393,2.94288346 6.598393,6.59839346 V 56.802207 c 0,3.65551 -2.942883,6.598393 -6.598393,6.598393 H 7.1977966 c -3.65551,0 -6.59839346,-2.942883 -6.59839346,-6.598393 V 7.1977966 c 0,-3.65551 2.94288346,-6.59839346 6.59839346,-6.59839346 z"
						></path>
					</g>
				</svg>
				<p tw="ml-3 font-semibold">${siteConfig.title}</p>
			</div>
			<p>by ${siteConfig.author}</p>
		</div>
	</div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title } = context.props as Props;

	const postDate = getFormattedDate(pubDate, {
		month: "long",
		weekday: "long",
	});
	const svg = await satori(markup(title, postDate), ogOptions);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.slug },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}));
}
