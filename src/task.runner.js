const MIN_TASK_CHECK_INTERVAL = 3600;

class TaskRunner {
    static #logger = console;
    static #runEvery = 3600;
    static #checkEvery = 3500; //every hour
    static #int = setInterval(TaskRunner.#check, TaskRunner.#checkEvery * 1000);
    static #tasks = [];

    static setLogger(logger) {
        TaskRunner.#logger = logger;
    }

    static #create(id, task, tag) {
        return {
            id,
            task,
            tag,
            count: 0,
            lastRunnedAt: -1,
        };
    }

    static add(task, tag) {
        const id = Math.random();
        if (!tag) {
            tag = `task#${TaskRunner.#tasks.length + 1}`;
        }
        TaskRunner.#tasks.push(TaskRunner.#create(id, task, tag));
    }

    static remove(id) {
        const task = TaskRunner.#tasks.find((item) => item.id === id);
        if (task) {
            TaskRunner.#tasks.splice(TaskRunner.#tasks.indexOf(task), 1);
            return true;
        }
        return false;
    }

    static clear() {
        this.#tasks = [];
    }

    static async #check() {
        try {
            const runners = TaskRunner.#tasks
                .filter(TaskRunner.#taskShouldBeRunned)
                .map(TaskRunner.#taskToPromise);
            await Promise.allSettled(runners);
        } catch (e) {
            TaskRunner.#logger.error("Task Set Failed", new Date(), e);
        }
    }

    static async #taskToPromise(taskItem) {
        const { tag } = taskItem;
        try {
            await taskItem.task();
            taskItem.lastRunnedAt = Date.now();
            taskItem.count += 1;
        } catch (e) {
            TaskRunner.#logger.error("Task Failed", tag, new Date(), e);
        }
    }

    static #taskShouldBeRunned(taskItem) {
        if (taskItem.count === 0) {
            return true;
        }
        return taskItem.lastRunnedAt < Date.now() - TaskRunner.#runEvery;
    }

    static stop() {
        clearInterval(TaskRunner.#int);
    }

    static start() {
        TaskRunner.#int = setInterval(
            TaskRunner.#check,
            TaskRunner.#checkEvery * 1000
        );
    }

    static setInterval(int = MIN_TASK_CHECK_INTERVAL) {
        if (isNaN(int) || int < MIN_TASK_CHECK_INTERVAL) {
            return false;
        }
        TaskRunner.#checkEvery = int;
        TaskRunner.stop();
        TaskRunner.start();
    }
}

module.exports = TaskRunner;
