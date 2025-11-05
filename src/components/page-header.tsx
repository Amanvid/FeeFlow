
interface PageHeaderProps {
    title: string;
    description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 font-headline">
                {title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                {description}
            </p>
        </div>
    )
}
