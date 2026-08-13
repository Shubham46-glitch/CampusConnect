import Event from '../models/Event.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private (All authenticated users)
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({})
      .populate('createdBy', 'name email role department')
      .populate('participants', 'name email rollNumber department')
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private (All authenticated users)
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email role department profileInfo')
      .populate('participants', 'name email rollNumber department profileInfo');

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Faculty/Admin)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, time, venue, capacity, category, status } = req.body;

    // Field presence checks
    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({ message: 'Please provide all required event details' });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      venue: venue.trim(),
      capacity: capacity ? Number(capacity) : 100,
      category: category || 'academic',
      status: status || 'upcoming',
      createdBy: req.user._id, // Set automatically from authenticated user
      participants: [],
    });

    // Notify students about new campus event
    const students = await User.find({ role: 'student' }).select('_id');
    for (const student of students) {
      await createNotification({
        recipient: student._id,
        title: 'New Event',
        message: `A new campus event "${event.title}" has been added.`,
        type: 'event',
        relatedId: event._id,
        relatedType: 'Event',
      });
    }

    const populatedEvent = await Event.findById(event._id).populate(
      'createdBy',
      'name email role department'
    );

    res.status(201).json(populatedEvent);
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing event
// @route   PUT /api/events/:id
// @access  Private (Creator or Admin only)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Ownership & Authorization check: Only event creator or Admin can update
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to update this event',
      });
    }

    const isCancelled = req.body.status === 'cancelled';
    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;
    event.time = req.body.time || event.time;
    event.venue = req.body.venue || event.venue;
    event.capacity = req.body.capacity !== undefined ? Number(req.body.capacity) : event.capacity;
    event.category = req.body.category || event.category;
    event.status = req.body.status || event.status;

    const updatedEvent = await event.save();

    // Notify registered participants about update / cancellation
    if (event.participants && event.participants.length > 0) {
      const notifTitle = isCancelled ? 'Event Cancelled' : 'Event Updated';
      const notifMsg = isCancelled
        ? `The campus event "${event.title}" has been cancelled.`
        : `The details of "${event.title}" have been updated.`;

      for (const participantId of event.participants) {
        await createNotification({
          recipient: participantId,
          title: notifTitle,
          message: notifMsg,
          type: 'event',
          relatedId: event._id,
          relatedType: 'Event',
        });
      }
    }

    const populatedEvent = await Event.findById(updatedEvent._id)
      .populate('createdBy', 'name email role department')
      .populate('participants', 'name email rollNumber department');

    res.json(populatedEvent);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Creator or Admin only)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Ownership & Authorization check: Only event creator or Admin can delete
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to delete this event',
      });
    }

    await Event.deleteOne({ _id: event._id });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Register student for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
export const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Cannot register for cancelled event
    if (event.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot register for a cancelled event' });
    }

    // Check duplicate registration
    const isAlreadyRegistered = event.participants.some(
      (pId) => pId.toString() === req.user._id.toString()
    );
    if (isAlreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check capacity limit
    if (event.participants.length >= event.capacity) {
      return res.status(400).json({ message: 'Event capacity has been reached' });
    }

    event.participants.push(req.user._id);
    await event.save();

    // Create notifications with exact professional university format
    await createNotification({
      recipient: req.user._id,
      title: 'Event Registration Confirmed',
      message: `Your registration for "${event.title}" has been confirmed.`,
      type: 'event',
      relatedId: event._id,
      relatedType: 'Event',
    });

    if (event.createdBy && event.createdBy.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: event.createdBy,
        title: 'New Event Registration',
        message: `Student "${req.user.name}" has registered for "${event.title}".`,
        type: 'event',
        relatedId: event._id,
        relatedType: 'Event',
      });
    }

    const updatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email role department')
      .populate('participants', 'name email rollNumber department');

    res.json({ message: 'Successfully registered for event', event: updatedEvent });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel student event registration
// @route   DELETE /api/events/:id/register
// @access  Private (Student)
export const cancelRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const isRegistered = event.participants.some(
      (pId) => pId.toString() === req.user._id.toString()
    );
    if (!isRegistered) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    event.participants = event.participants.filter(
      (pId) => pId.toString() !== req.user._id.toString()
    );
    await event.save();

    // Create notifications for registration cancellation
    await createNotification({
      recipient: req.user._id,
      title: 'Event Registration Cancelled',
      message: `Your registration for "${event.title}" has been cancelled successfully.`,
      type: 'event',
      relatedId: event._id,
      relatedType: 'Event',
    });

    if (event.createdBy && event.createdBy.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: event.createdBy,
        title: 'Event Registration Cancelled',
        message: `Student "${req.user.name}" has cancelled their registration for "${event.title}".`,
        type: 'event',
        relatedId: event._id,
        relatedType: 'Event',
      });
    }

    const updatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email role department')
      .populate('participants', 'name email rollNumber department');

    res.json({ message: 'Registration cancelled successfully', event: updatedEvent });
  } catch (error) {
    next(error);
  }
};

// @desc    Get registered students list for an event
// @route   GET /api/events/:id/registrations
// @access  Private (Event Creator Faculty or Admin only)
export const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('participants', 'name email department profileInfo createdAt');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Authorization: Event creator or Admin only
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        message: 'Forbidden: You are not authorized to view registrations for this event',
      });
    }

    res.json({
      eventId: event._id,
      eventTitle: event.title,
      capacity: event.capacity,
      count: event.participants.length,
      participants: event.participants,
    });
  } catch (error) {
    next(error);
  }
};
