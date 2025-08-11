import { getAllPosts } from "@/lib/wordpress/wordpress";
import { PostCard } from "./PostCard";

export const revalidate = 86400; // 24 hours

export async function LatestPosts() {
  try {
    const posts = await getAllPosts();
    const latestPosts = posts.slice(0, 3);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {latestPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error fetching latest posts:', error);
    // Return a fallback UI instead of null
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-secondary rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Latest Insights</h3>
          <p className="text-muted-foreground">Stay tuned for our latest luxury real estate insights and market updates.</p>
        </div>
        <div className="bg-secondary rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Market Trends</h3>
          <p className="text-muted-foreground">Discover the latest trends in branded residences and luxury properties.</p>
        </div>
        <div className="bg-secondary rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Investment Guide</h3>
          <p className="text-muted-foreground">Expert insights on making smart investments in luxury real estate.</p>
        </div>
      </div>
    );
  }
} 