export const createRecord = async(req, res) => {
    try {
        const {
            fileName,
            recordTitle,
            aim,
            procedure,
            result,
            program,
            output
        } = req.body;

        if (!fileName || !recordTitle || !aim || !procedure || !result || !program || !output) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newRecord = new Record({
            userId: req.user._id,
            fileName,
            recordTitle,
            aim,
            procedure,
            result,
            program,
            output
        });

        await newRecord.save();
        res.status(201).json({ message: "Record created successfully", record: newRecord });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error In the createRecord" });
    }
}

export const getRecord = async (req, res) => {
    try {
        const { recordId } = req.params;

        if (!recordId) {
            return res.status(400).json({ message: "Record ID is required" });
        }

        const record = await Record.findById(recordId);

        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        // Optional: Check if the record belongs to the authenticated user
        if (record.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. This record doesn't belong to you" });
        }

        res.status(200).json({ 
            message: "Record retrieved successfully", 
            record: record 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error in getRecord" });
    }
};