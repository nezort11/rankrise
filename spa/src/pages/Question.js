import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../client";
import { APIError, DoesNotExistsError } from "../client/errors";
import moment from "moment";
import {
  ButtonGroup,
  Button,
  Form,
  OverlayTrigger,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import routes from "../routes";
import Modal from "../components/Modal";
import { useUserContext } from "../hooks/UserContext";
import AsyncSelect from "react-select/async";
import ReportModal from "../components/ReportModal";
import { ObjectModel } from "../client/models";
import {
  faFlag,
  faAngleUp,
  faAngleDown,
  faBullhorn,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircularProgress from "../components/CircularProgress";
import { Price } from "../client/models";

const Headline = ({ question, onReport, onSuggest }) => {
  if (question === undefined) {
    return (
      <div>
        <Spinner animation="grow" />
      </div>
    );
  }

  // const renderReportTooltip = ({ props }) => (
  // );

  return (
    <div className="headline">
      <div className="headline-block">
        <OverlayTrigger
          placement="right"
          delay={{ show: 250, hide: 400 }}
          overlay={
            <Tooltip id="button-tooltip">Report as inappropriate</Tooltip>
          }
        >
          <div className="report-flag">
            <FontAwesomeIcon icon={faFlag} onClick={onReport} />
          </div>
        </OverlayTrigger>
        <div className="content">
          <h1>{question.title}</h1>
          <div className="d-flex justify-content-between">
            <Category question={question} />
            <div>Asked {moment(question.askTime).fromNow()}</div>
          </div>
        </div>
        <Button
          onClick={onSuggest}
          size="lg"
          variant="tertiary"
          className="btn-suggest"
        >
          Suggest
        </Button>
      </div>
    </div>
  );
};

const Category = ({ question }) => {
  const [category, setCategory] = useState(null);

  const fetchCategory = async () => {
    try {
      setCategory(await api.categories.retrieve({ id: question.category }));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  if (category === null) {
    return (
      <div>
        Category... <Spinner animation="border" size="sm" />
      </div>
    );
  }

  return <div>{category.name}</div>;
};

const ShareExperienceModal = ({
  show = false,
  question,
  option,
  vote,
  setVote,
  onHide,
}) => {
  const [experience, setExperience] = useState(null);

  const handleChange = (e) => {
    setExperience(e.target.value);
  };

  const handleShare = async (e) => {
    e.preventDefault();

    try {
      await api.votes.update({
        questionId: question.pk,
        optionId: option.id,
        voteId: vote?.at(0)?.id,
        up: vote?.at(0)?.up,
        experience: experience,
      });

      setVote([{ ...vote?.at(0), experience }]);
      onHide();
    } catch (error) {
      throw error;
    }
  };

  return (
    <Modal
      className="share-experience-modal"
      header={<>Share your Experience</>}
      footer={
        <Button
          className="modal__button--action"
          variant="tertiary"
          type="submit"
        >
          Share
        </Button>
      }
      show={show}
      onHide={onHide}
    >
      <Form onSubmit={handleShare}>
        <Form.Label>Experience</Form.Label>
        <Form.Control
          className="share-experience-modal__experience"
          as="textarea"
          name="experience"
          onChange={handleChange}
        />
        <div className="share-experience-modal__help-text">Optional</div>
      </Form>
    </Modal>
  );
};

const Option = ({ question, option, onVote }) => {
  const [product, setProduct] = useState(null);
  const [firstProductImage, setFirstProductImage] = useState(null);
  const [vote, setVote] = useState(null);
  const [shareShown, setShareShown] = useState(false);
  // Computed
  const votedUp = vote?.at(0)?.up === true;
  const votedDown = vote?.at(0)?.up === false;
  const voteId = vote?.at(0)?.id || null;

  const [user, setUser] = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProduct = async () => {
    try {
      setProduct(await api.products.retrieve({ id: option.product }));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [option]);

  const fetchFirstImage = async () => {
    try {
      setFirstProductImage(
        await api.productImages.retrieve({ id: product.images[0] })
      );
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (product?.images[0]) {
      fetchFirstImage();
    }
  }, [product]);

  const fetchVote = async () => {
    try {
      const votes = await api.votes.list({
        questionId: question.pk,
        optionId: option.id,
      });

      setVote(votes);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchVote();
  }, [option]);

  const createVote = async (up) => {
    try {
      const vote = await api.votes.create({
        questionId: question.pk,
        optionId: option.id,
        up: true,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleUserNotAuthenticated = () => {
    if (user === null) {
      navigate(routes.login, { state: { from: location } });
    }
  };

  const handleUpvoteClick = async () => {
    handleUserNotAuthenticated();
    if (user === undefined) {
      return;
    }

    if (votedUp) {
      await api.votes.delete({
        questionId: question.pk,
        optionId: option.id,
        voteId: voteId,
      });

      onVote(false, null);

      return;
    }

    if (votedDown) {
      // Change downvote to upvote
      await api.votes.update({
        questionId: question.pk,
        optionId: option.id,
        voteId: voteId,
        up: true,
      });

      onVote(true, false);
      return;
    }

    try {
      await createVote(true);
      onVote(true);
    } catch (error) {
      throw error;
    }
  };

  const handleDownvoteClick = async () => {
    handleUserNotAuthenticated();
    if (user === undefined) {
      return;
    }

    if (votedUp) {
      // Change downvote to upvote
      await api.votes.update({
        questionId: question.pk,
        optionId: option.id,
        voteId: voteId,
        up: false,
      });

      onVote(false, true);
      return;
    }

    if (votedDown) {
      await api.votes.delete({
        questionId: question.pk,
        optionId: option.id,
        voteId: voteId,
      });

      onVote(null, false);

      return;
    }

    try {
      await createVote(false);
      onVote(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <div className="option card">
        <div className="option-header">
          <CircularProgress percent={option.rank} />
          {product !== null ? (
            <div className="option-name">{product.name}</div>
          ) : (
            <Spinner animation="grow" />
          )}
        </div>

        <div>
          {product !== null ? (
            <Link to={routes.product(product.pk)}>
              {firstProductImage && (
                <img src={firstProductImage.url} className="option-image" />
              )}
            </Link>
          ) : (
            <Spinner animation="grow" />
          )}
        </div>
        <div className="option-footer">
          <div className="option-price">
            {product !== null ? (
              product.price.value === Price.Free ? (
                <div className="option-price-free">
                  FREE
                  <FontAwesomeIcon icon={faLink} />
                </div>
              ) : product.price.value === Price.Paid ? (
                <div className="option-price-paid">
                  PAID
                  <FontAwesomeIcon icon={faLink} />
                </div>
              ) : product.price.value === Price.OpenSource ? (
                <div className="option-price-open">
                  OPEN
                  <FontAwesomeIcon icon={faLink} />
                </div>
              ) : (
                <></>
              )
            ) : (
              <Spinner animation="grow" />
            )}
          </div>
          <div className="option-footer-right">
            <div className="option-votes">
              <ButtonGroup>
                <Button
                  variant="link"
                  className={`option-upvote text-dark text-decoration-none  ${
                    votedUp && " fw-bold"
                  }`}
                  onClick={handleUpvoteClick}
                >
                  <FontAwesomeIcon icon={faAngleUp} />
                  <div>{option.upvotes}</div>
                  <div>Recommend</div>
                </Button>
                <Button
                  variant="link"
                  className={`option-downvote text-dark text-decoration-none ${
                    votedDown && " fw-bold"
                  }`}
                  onClick={handleDownvoteClick}
                >
                  <FontAwesomeIcon icon={faAngleDown} /> {option.downvotes}
                </Button>
              </ButtonGroup>
            </div>
            <div className="option-share">
              <Button onClick={() => setShareShown(true)} className="d-block">
                <FontAwesomeIcon icon={faBullhorn} />
              </Button>
            </div>
          </div>
          {/* <div>Experience: {vote?.at(0)?.experience}</div> */}
        </div>
      </div>
      <ShareExperienceModal
        show={shareShown}
        question={question}
        option={option}
        vote={vote}
        setVote={setVote}
        onHide={() => setShareShown(false)}
      />
    </>
  );
};

// question prop should not be undefined or null => This component should not be rendered at all
const Options = ({ question }) => {
  const [options, setOptions] = useState(null);

  const fetchOptions = async () => {
    try {
      setOptions(await api.options.list({ questionId: question.pk }));
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [question]);

  // Voting

  const handleVote = (up = null, down = null, optionIndex) => {
    const optionsCopy = JSON.parse(JSON.stringify(options));
    if (up !== null) {
      if (up) {
        optionsCopy.results[optionIndex].upvotes += 1;
      } else {
        optionsCopy.results[optionIndex].upvotes -= 1;
      }
    }
    if (down !== null) {
      if (down) {
        optionsCopy.results[optionIndex].downvotes += 1;
      } else {
        optionsCopy.results[optionIndex].downvotes -= 1;
      }
    }
    setOptions(optionsCopy);
  };

  // --- Rendering ---

  if (options === null) {
    return <Spinner animation="grow" />;
  }

  return options.results.map((option, index) => (
    <Option
      key={option.id}
      question={question}
      option={option}
      onVote={(upvote, downvote) => handleVote(upvote, downvote, index)}
    />
  ));
};

const ProductSuggestModal = ({ defaultShow, question, onSuggest, onClose }) => {
  const [shown, setShown] = useState(defaultShow);
  const [selectedValue, setSelectedValue] = useState(null);
  const fetchTimeoutId = useRef(null);
  const [user] = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setShown(defaultShow);
  }, [defaultShow]);

  const handleSuggestClick = () => {
    if (user === undefined) {
      return;
    }

    if (user === null) {
      navigate(routes.login, { state: { from: location, replace: true } });
    }

    setShown(true);
  };

  const fetchProducts = async (inputValue) => {
    try {
      return await api.products.search({ query: inputValue });
    } catch (error) {
      throw error;
    }
  };

  const handleInputChange = (value) => {
    if (value) {
      setSelectedValue(value);
    }
  };

  const loadOptions = (inputValue, callback) => {
    // Clear set timeout on previous loadOptions call
    if (fetchTimeoutId.current !== null) {
      clearTimeout(fetchTimeoutId.current);
    }

    fetchTimeoutId.current = setTimeout(async () => {
      const products = await fetchProducts(inputValue);

      const options = products.results.map((product) => ({
        value: product.pk,
        label: product.name,
      }));
      callback(options);
    }, 1000);
  };

  const createOption = async () => {
    try {
      console.log(`Question: ${question.pk}, Product: ${selectedValue.value}`);
      await api.options.create({
        questionId: question.pk,
        productId: selectedValue.value,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleSuggestOption = async () => {
    if (selectedValue) {
      await createOption();

      // Navigate to the same page to clear location.state
      navigate(location.pathname, { replace: true });
      setShown(false);
      onSuggest();
    }
  };

  const handleAddNewClick = () => {
    navigate(routes.productAdd, { state: { from: location } });
  };

  return (
    <>
      <div className="d-flex justify-content-center">
        <Button
          onClick={handleSuggestClick}
          variant="tertiary"
          className="btn-suggest"
        >
          Suggest
        </Button>
      </div>
      <Modal
        header={<div>Suggest an Option</div>}
        footer={
          <Button
            className="modal__button--action"
            variant="tertiary"
            onClick={handleSuggestOption}
          >
            Suggest
          </Button>
        }
        show={shown}
        onHide={() => {
          setShown(false);
          onClose();
        }}
      >
        <Form.Label>Select existing product</Form.Label>
        <AsyncSelect
          // cacheOptions
          loadOptions={loadOptions}
          onInputChange={handleInputChange}
          onChange={(newSelectedValue) => setSelectedValue(newSelectedValue)}
        />
        <p className="mt-3">Or</p>
        <Button
          className="p-0 text-dark"
          variant="link"
          onClick={handleAddNewClick}
        >
          Add new
        </Button>
      </Modal>
    </>
  );
};

const Question = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  delete location.state?.from;
  const [question, setQuestion] = useState(undefined);
  const [showReportModal, setShowReportModal] = useState(false);
  const [defaultShown, setDefaultShown] = useState(from === routes.productAdd);

  const fetchQuestion = async () => {
    try {
      setQuestion(await api.questions.retrieve({ id }));
    } catch (error) {
      if (error instanceof APIError) {
        if (error instanceof DoesNotExistsError) {
          navigate(routes.notFound, { replace: true });
        }

        // TODO: display error message
      }

      throw error;
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const handleOptionSuggest = () => {
    // Trigger question state change + refetch
    setQuestion(undefined);
  };

  useEffect(() => {
    if (question === undefined) {
      fetchQuestion();
    }
  }, [question]);

  return (
    <>
      <div className="question">
        <Headline
          question={question}
          onReport={() => setShowReportModal(true)}
          onSuggest={() => setDefaultShown(true)}
        />
        <hr />
        {/* {question && <Category question={question} />} */}

        {question ? (
          <Options question={question} />
        ) : (
          <Spinner animation="grow" />
        )}
        <ProductSuggestModal
          defaultShow={defaultShown}
          question={question}
          onSuggest={handleOptionSuggest}
          onClose={() => setDefaultShown(false)}
        />
      </div>
      <ReportModal
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        model={ObjectModel.Question}
        id={id}
      />
    </>
  );
};

export default Question;
