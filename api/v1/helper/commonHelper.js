const deleteUser = async (moduleName, userIdToDelete) => {
    const usersCollection = database.collection(moduleName);
    const collectionsToCheck = ['warehouses', 'dealers', 'orders'];

    let hasReferences = false;

    // Check for references in each collection
    for (const collection of collectionsToCheck) {
        const currentCollection = database.collection(collection);
        const userReference = await currentCollection.findOne({ userId: userIdToDelete });

        if (userReference) {
            hasReferences = true;
            console.log(`Cannot delete user. Found reference in ${collection} collection.`);
        }
    }

    if (!hasReferences) {
        // Delete the user
        const deleteResult = await usersCollection.deleteOne({ _id: userIdToDelete });

        if (deleteResult.deletedCount === 1) {
            console.log('User deleted successfully.');
        } else {
            console.log('User deletion failed.');
        }
    }
}

module.exports = {
    deleteUser
}
