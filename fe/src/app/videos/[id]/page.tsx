
export default async function DetailVideo({ params }: any) {
    const { id } = await params;
    console.log(id);

    return (
        <div>page</div>
    )
}
